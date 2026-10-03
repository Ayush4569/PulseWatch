import { Server, Socket } from "socket.io";
import { Server as httpServer } from "http";
import { verifyAccessToken } from "../utils/token.js";

declare module "socket.io" {
    interface Socket {
        user: { id: string }
    }
}
export const initalizeSocket = (server: httpServer) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000"
        }
    })

    // authenticate user
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication error: Token required'));
        }
        try {
            const decoded = verifyAccessToken(token);
            socket.user.id = decoded.id;
            next()
        } catch (error) {
            return next(new Error('Authentication error: Invalid token'));
        }
    })

    io.on("connection", (socket) => {
        console.log('User connected:', socket.user.id);
        socket.join(`user:${socket.user.id}`)
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.user.id}`);
        })
    })

    return io;
}