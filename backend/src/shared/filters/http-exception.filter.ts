import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { API_ERROR_CODES } from '../constants/http.constants';
import { ApiErrorResponse, ApiFieldError } from '../types/api-response.types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, code, message, details } = this.resolveException(exception);

    this.logger.error(
      `[${code}] ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    const body: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details: details ?? null,
      },
    };

    response.status(status).json(body);
  }

  private resolveException(exception: unknown): {
    status: number;
    code: string;
    message: string;
    details: ApiFieldError[] | null;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const raw = exception.getResponse();

      // class-validator failures arrive as an object with a `message` array
      if (
        status === HttpStatus.UNPROCESSABLE_ENTITY ||
        status === HttpStatus.BAD_REQUEST
      ) {
        if (
          typeof raw === 'object' &&
          raw !== null &&
          'message' in raw &&
          Array.isArray((raw as Record<string, unknown>).message)
        ) {
          const details = this.parseValidationErrors(
            (raw as { message: string[] }).message,
          );
          return {
            status,
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message: 'Request validation failed',
            details,
          };
        }
      }

      // Domain exception — code is attached by custom exception classes (see 25.6)
      const domainCode =
        typeof raw === 'object' && raw !== null && 'code' in raw
          ? (raw as { code: string }).code
          : this.httpStatusToCode(status);

      return {
        status,
        code: domainCode,
        message: exception.message,
        details: null,
      };
    }

    // Unhandled / unexpected error
    this.logger.error('Unexpected non-HTTP exception', exception);
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      details: null,
    };
  }

  private parseValidationErrors(messages: string[]): ApiFieldError[] {
    return messages.map((msg) => {
      // class-validator messages follow the pattern "field message"
      const spaceIdx = msg.indexOf(' ');
      return spaceIdx === -1
        ? { field: 'unknown', message: msg }
        : { field: msg.slice(0, spaceIdx), message: msg.slice(spaceIdx + 1) };
    });
  }

  private httpStatusToCode(status: number): string {
    const map: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: API_ERROR_CODES.VALIDATION_ERROR,
      [HttpStatus.UNAUTHORIZED]: API_ERROR_CODES.UNAUTHORIZED,
      [HttpStatus.FORBIDDEN]: API_ERROR_CODES.FORBIDDEN,
      [HttpStatus.NOT_FOUND]: API_ERROR_CODES.NOT_FOUND,
      [HttpStatus.CONFLICT]: API_ERROR_CODES.CONFLICT,
      [HttpStatus.INTERNAL_SERVER_ERROR]: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    };
    return map[status] ?? API_ERROR_CODES.INTERNAL_SERVER_ERROR;
  }
}
