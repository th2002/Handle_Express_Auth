class ApiError extends Error {
  constructor(statusCode, message) {
    // (Error) There is a property message so call it in super
    super(message);

    // The name of the custom Error. If not set, it will inherit "Error" by default.
    this.name = "ApiError";

    // Assign additional http status code here
    this.statusCode = statusCode || 500;

    // Record the Stack Trace to facilitate debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;

