import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodType } from "zod";
import { CustomError } from "../utils/apiError.js";

const validate = (schema: ZodType)=> {
    return (req: Request, res: Response, next: NextFunction)=> {
        const result = schema.safeParse(req.body || {});

        if (!result.success) {
            throw new CustomError(
                400,
                result.error.issues[0]?.message || "Invalid request data"
            );
        }

        req.body = result.data;
        next();
    }
}
export default validate;