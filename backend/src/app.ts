import dotevn from "dotenv"
dotevn.config()
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Uptime Monitor API is running"
    });
});

export default app;