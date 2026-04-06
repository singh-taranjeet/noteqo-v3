import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { AUTH_ERROR_MESSAGES } from '../constants/auth.constants';

/**
 * Guard that checks if the current request has a valid authenticated user
 * (set by AuthMiddleware on req.user).
 *
 * Apply at the controller or route level to protect endpoints.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.AUTH_REQUIRED);
    }

    return true;
  }
}
