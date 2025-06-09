export class HttpError extends Error {
  public statusCode: number;
  constructor({
    message,
    statusCode,
    name,
  }: {
    statusCode: number;
    message: string;
    name?: string;
  }) {
    super(message);
    this.statusCode = statusCode;
    this.name = name || "HttpError";
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super({ statusCode: 400, message, name: "BadRequestError" });
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super({ statusCode: 401, message, name: "UnauthorizedError" });
  }
}
export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super({ statusCode: 403, message, name: "ForbiddenError" });
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super({ statusCode: 404, message, name: "NotFoundError" });
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super({ statusCode: 409, message, name: "ConflictError" });
  }
}

export class NotProvidedError extends HttpError {
  constructor(message: string) {
    super({ statusCode: 422, message, name: "NotProvidedError" });
  }
}

export class DbError extends HttpError {
  constructor(message: string) {
    super({ statusCode: 422, message, name: "DbError" });
  }
}
