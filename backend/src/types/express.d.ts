import { Request } from "express";

export interface AuthUser {
    id: string;
    email: string;
    username: string;
    isGuest?: boolean;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
