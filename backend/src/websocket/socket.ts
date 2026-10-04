import { Server, Socket } from "socket.io";
import { Server as httpServer } from "http";
import { verifyAccessToken } from "../utils/token.js";
import { redisSubscriber } from "../config/redis.js";
import { EVENT_CHANNEL } from "./publisher.js";
import { emitIncidentCreated, emitIncidentResolved, emitMonitorCheck, SOCKET_EVENTS } from "./events.js";

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

    redisSubscriber.subscribe(EVENT_CHANNEL)
        .then(() => console.log(`Subscribed to ${EVENT_CHANNEL}`))
        .catch((error) => {
            console.error(
                "Failed to subscribe to Redis events:",
                error
            );
        })

    redisSubscriber.on("message", (channel, message) => {
        if (channel != EVENT_CHANNEL) return;
        try {
            const event = JSON.parse(message);
            const { type, userId, data } = event;

            switch (type) {
                case SOCKET_EVENTS['MONITOR_CHECK']:
                    emitMonitorCheck(io, userId, data);
                    break;

                case SOCKET_EVENTS['INCIDENT_CREATED']:
                    emitIncidentCreated(io, userId, data);
                    
                case SOCKET_EVENTS['INCIDENT_RESOLVED']:
                    emitIncidentResolved(io, userId, data);

                default:
                    console.warn(`Unknown socket event: ${type}`);
            }
        } catch (error) {
            console.error(
                "Failed to process Redis event:",
                error
            );
        }
    })
    return io;
}