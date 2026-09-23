import type { Request, Response, NextFunction } from "express";
class CustomError extends Error {
    statusCode: number;
    message: string = "Something went wrong";
    success: boolean;

    constructor(statusCode: number, message: string) {
        super(message)
        this.statusCode = statusCode;
        this.success = false
    }
}

interface ErrorWithStatusCode extends Error {
    statusCode: number
}

const errorHandler =  (err: ErrorWithStatusCode, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error"

    console.error("---- Error Occurred ----");
    console.error("Method:", req.method);
    console.error("Endpoint:", req.originalUrl);
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);

    return res.status(statusCode).json({
        success: false,
        message
    })
}

export {errorHandler,CustomError}