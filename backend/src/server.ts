import { createServer } from "http";
import app from "./app.js";
import { config } from "./config/env.js";
import { initalizeSocket } from "./websocket/socket.js";

const PORT = config.PORT || 5000;

const httpServer = createServer(app);
initalizeSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});