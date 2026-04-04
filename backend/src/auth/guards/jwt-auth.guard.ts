import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

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
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}
