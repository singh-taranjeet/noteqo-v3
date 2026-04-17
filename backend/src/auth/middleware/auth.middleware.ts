import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ClsService } from 'nestjs-cls';

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly cls: ClsService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = this.jwtService.verify(token);

        // Load the authorized identifier successfully into Async Local Storage
        // to grant hands-free access for TypeORM hooks like @BeforeInsert
        this.cls.set('user', { id: decoded.sub, email: decoded.email });

        // Also map to explicit req object for fallback controller payloads
        (req as AuthenticatedRequest).user = {
          id: decoded.sub,
          email: decoded.email,
        };
      } catch (err) {
        this.logger.warn(`Invalid JWT token rejected: ${err.message}`);
      }
    }

    // Auth Middleware shouldn't block the request entirely unless we mount Guards securely.
    // This simply extracts identities. We will use a dedicated explicit Guard when necessary soon natively.
    next();
  }
}
