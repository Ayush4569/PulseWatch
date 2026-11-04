import { createServer } from "http";
import app from "./app.js";
import { config } from "./config/env.js";
import { initalizeSocket } from "./websocket/socket.js";
import { reconcileSchedulers } from "./jobs/scheduler.js";

const PORT = config.PORT || 8000;

const httpServer = createServer(app);

initalizeSocket(httpServer);

const startServer = async () => {
    try {
        await reconcileSchedulers();

        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();