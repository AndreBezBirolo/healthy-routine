export class AppError extends Error {
    statusCode;
    errorCode;
    details;
    constructor(errorCode, statusCode = 400, details) {
        super(errorCode);
        this.name = 'AppError';
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
