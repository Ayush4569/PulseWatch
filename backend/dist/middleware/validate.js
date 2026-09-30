import { CustomError } from "../utils/apiError.js";
const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body || {});
        if (!result.success) {
            throw new CustomError(400, result.error.issues[0]?.message || "Invalid request data");
        }
        req.body = result.data;
        next();
    };
};
export default validate;
