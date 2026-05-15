import {
  Controller,
  Get,
  Query,
  Res,
  Logger,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { EventsService } from './events.service';
import { EVENTS_ROUTES, EVENTS_CONFIG } from './constants/events.constants';
import { SpacesRepository } from '../spaces/spaces.repository';
import type { RealtimeEvent } from './types/events.types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { getCurrentUserId } from 'src/shared/utils/cls.utils';
import { SpaceRoleGuard } from '../auth/guards/space-role.guard';
import { RequireSpaceRole } from '../shared/decorators/space-role.decorator';

/**
 * SSE controller for real-time note events.
 *
 * The endpoint verifies space membership,
 * subscribes to Redis channels, and streams events as SSE.
 *
 * Note: SSE is used instead of WebSockets because we only need
 * unidirectional server→client push. EventSource natively reconnects.
 */
@Controller(EVENTS_ROUTES.BASE)
@UseGuards(JwtAuthGuard, SpaceRoleGuard)
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly spacesRepository: SpacesRepository,
  ) { }

  @Get(EVENTS_ROUTES.STREAM)
  @RequireSpaceRole({ resourceType: 'events' })
  async stream(
    @Query('token') token: string,
    @Query('spaceIds') spaceIdsParam: string,
    @Res() res: Response,
  ): Promise<void> {

    const userId: string = getCurrentUserId();

    // 2. Parse and validate space IDs
    if (!spaceIdsParam) {
      throw new UnauthorizedException('spaceIds query param is required');
    }
    const spaceIds = spaceIdsParam.split(',').filter(Boolean);
    if (spaceIds.length === 0) {
      throw new UnauthorizedException('At least one spaceId is required');
    }

    // Space membership is now verified by SpaceRoleGuard automatically!
    // 3. Track connection for lifecycle hooks

    // 4. Set up SSE response headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    this.logger.log(
      `SSE connection opened for user ${userId}, spaces: ${spaceIds.join(', ')}`,
    );

    // 5. Subscribe to Redis channels for each space
    const unsubscribers: Array<() => void> = [];

    const onEvent = (event: RealtimeEvent) => {
      // Don't echo back events to the user who triggered them
      if (event.updatedBy === userId) return;

      const data = JSON.stringify(event);
      res.write(`event: ${event.type}\ndata: ${data}\n\n`);
    };

    for (const spaceId of spaceIds) {
      const unsub = await this.eventsService.subscribe(spaceId, onEvent);
      unsubscribers.push(unsub);
    }

    // 6. Keep-alive heartbeat to prevent proxy timeouts
    const keepAlive = setInterval(() => {
      res.write(':keepalive\n\n');
    }, EVENTS_CONFIG.SSE_KEEPALIVE_MS);

    // 7. Cleanup on client disconnect
    res.on('close', () => {
      this.logger.log(`SSE connection closed for user ${userId}`);
      clearInterval(keepAlive);
      for (const unsub of unsubscribers) {
        unsub();
      }
      res.end();
    });
  }
}
