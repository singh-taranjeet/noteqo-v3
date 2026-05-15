import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CONFIG_KEYS } from '../config';
import { EVENTS_CONFIG } from './constants/events.constants';
import type { RealtimeEvent } from './types/events.types';

/**
 * Manages Redis Pub/Sub for real-time note events.
 *
 * Uses two Redis clients: one for publishing, one for subscribing.
 * Redis Pub/Sub requires a dedicated connection for subscriptions
 * because the client enters "subscriber mode" and can't issue other commands.
 */
@Injectable()
export class EventsService implements OnModuleDestroy {
  private readonly logger = new Logger(EventsService.name);
  private readonly publisher: Redis;
  private readonly subscriber: Redis;

  /** Map of channel → Set of listener callbacks */
  private readonly listeners = new Map<string, Set<(event: RealtimeEvent) => void>>();

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get(`${CONFIG_KEYS.REDIS}.url`);

    this.publisher = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);

    this.subscriber.on('message', (channel: string, message: string) => {
      const callbacks = this.listeners.get(channel);
      if (!callbacks || callbacks.size === 0) return;

      try {
        const event = JSON.parse(message) as RealtimeEvent;
        for (const cb of callbacks) {
          cb(event);
        }
      } catch (err) {
        this.logger.error(`Failed to parse event on ${channel}`, err);
      }
    });
  }

  /**
   * Publishes a note event to the space-scoped Redis channel.
   */
  async publish(event: RealtimeEvent): Promise<void> {
    const channel = this.getChannel(event.spaceId);
    await this.publisher.publish(channel, JSON.stringify(event));
    this.logger.debug(`Published ${event.type} on ${channel}`);
  }

  /**
   * Subscribes to a space's event channel.
   * Returns an unsubscribe function.
   */
  async subscribe(
    spaceId: string,
    callback: (event: RealtimeEvent) => void,
  ): Promise<() => void> {
    const channel = this.getChannel(spaceId);

    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
      await this.subscriber.subscribe(channel);
      this.logger.debug(`Subscribed to Redis channel: ${channel}`);
    }

    this.listeners.get(channel)!.add(callback);

    // Return unsubscribe function
    return async () => {
      const callbacks = this.listeners.get(channel);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(channel);
          await this.subscriber.unsubscribe(channel);
          this.logger.debug(`Unsubscribed from Redis channel: ${channel}`);
        }
      }
    };
  }

  private getChannel(spaceId: string): string {
    return `${EVENTS_CONFIG.CHANNEL_PREFIX}:${spaceId}:${EVENTS_CONFIG.CHANNEL_SUFFIX}`;
  }

  async onModuleDestroy(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}
