import { Logger } from './logger';
import * as Sentry from '@sentry/nextjs';

export class ErrorTracker {
  static captureError(error: Error | unknown, metadata?: Record<string, any>) {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    
    Logger.error('Application Error Captured', normalizedError, metadata);
    
    // Push the error to Sentry with context metadata
    Sentry.captureException(normalizedError, { extra: metadata || {} });
  }

  static captureRejection(reason: string, metadata?: Record<string, any>) {
    Logger.warn('Enforcement Rejection', { reason, ...metadata });
    Sentry.captureMessage(`Enforcement Rejection: ${reason}`, { level: 'warning', extra: metadata || {} });
  }
}
