import { CustomError } from "../utils/apiError.js";
import { verifyAccessToken } from "../utils/token.js";
export const authenticate = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token;
        if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }
        else if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
        if (!token) {
            throw new CustomError(401, "Unauthorized access: Token missing");
        }
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof CustomError) {
            next(error);
        }
        else {
            next(new CustomError(401, "Invalid or expired access token"));
        }
    }
};
