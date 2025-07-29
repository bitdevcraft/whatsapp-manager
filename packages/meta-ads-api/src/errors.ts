// Base API error
export class ApiError extends Error {
  public readonly status: number;
  public readonly data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Example of a custom 404 error
export class NotFoundError extends ApiError {
  constructor(message = "Resource not found", data?: any) {
    super(message, 404, data);
    this.name = "NotFoundError";
  }
}
