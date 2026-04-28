/**
 * Application-level error type with HTTP status and optional details payload.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  /**
   * @param message Human-readable error message.
   * @param statusCode HTTP status code for the error response.
   * @param details Optional structured metadata for debugging or client hints.
   */
  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}