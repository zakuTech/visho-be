import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { HttpResponse, HttpError } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: HttpError = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error.message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;

        message = responseObj.message || message;
        error.message = Array.isArray(responseObj.message)
          ? responseObj.message.join(', ')
          : responseObj.message;

        error.code = responseObj.error || this.getErrorCode(status);

        if (responseObj.message && Array.isArray(responseObj.message)) {
          error.fields = this.formatValidationErrors(responseObj.message);
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error.message = exception.message;
    }

    const errorResponse: HttpResponse = {
      success: false,
      message,
      data: null,
      error,
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }

  private formatValidationErrors(messages: string[]): Record<string, string[]> {
    const fields: Record<string, string[]> = {};

    messages.forEach((msg) => {
      const match = msg.match(/^(\w+)\s+(.+)$/);
      if (match) {
        const [, field, error] = match;
        if (!fields[field]) {
          fields[field] = [];
        }
        fields[field].push(error);
      } else {
        if (!fields.general) {
          fields.general = [];
        }
        fields.general.push(msg);
      }
    });

    return fields;
  }
}
