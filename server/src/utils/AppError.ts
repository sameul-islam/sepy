class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    details?: unknown,
  ) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default AppError;