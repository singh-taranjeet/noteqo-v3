import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse, ApiPaginationMeta } from '../types/api-response.types';

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the service already returned the full envelope, pass through untouched
        if (data !== null && typeof data === 'object' && 'success' in data) {
          return data as unknown as ApiSuccessResponse<T>;
        }

        const meta = this.extractMeta(data);
        const payload = meta ? (data as PaginatedServiceResult<T>).data : (data ?? null);

        return {
          success: true,
          data: payload as T | null,
          meta,
        };
      }),
    );
  }

  private extractMeta(data: unknown): ApiPaginationMeta | null {
    if (
      data !== null &&
      typeof data === 'object' &&
      'total' in data &&
      'limit' in data &&
      'offset' in data
    ) {
      const d = data as PaginatedServiceResult<unknown>;
      return {
        total: d.total,
        limit: d.limit,
        offset: d.offset,
        hasNextPage: d.offset + d.limit < d.total,
      };
    }
    return null;
  }
}

// Internal helper type — not exported
interface PaginatedServiceResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
