import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'object'
          ? (exceptionResponse as any).message || exceptionResponse
          : exceptionResponse;
      error = exception.name;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = exception.name;

      // Log full stack for unexpected errors
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'UnknownError';

      this.logger.error(`Unknown exception type: ${JSON.stringify(exception)}`);
    }

    const errorResponse = {
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Log all errors with context
    const logMessage = `[${request.method}] ${request.url} → ${status} | ${typeof message === 'string' ? message : JSON.stringify(message)}`;

    if (status >= 500) {
      this.logger.error(logMessage);
    } else if (status >= 400) {
      this.logger.warn(logMessage);
    }

    response.status(status).json(errorResponse);
  }
}
