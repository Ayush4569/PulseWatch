import { CustomError } from "../../utils/apiError.js";
import pool from "../../db/client.js";
const createMonitorService = async (url, interval, userId) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`INSERT INTO monitors
                (user_id, url, interval_seconds)
             VALUES
                ($1, $2, $3)
             RETURNING
                id,
                url,
                interval_seconds,
                is_active,
                created_at`, [userId, url, interval]);
        const monitor = result.rows[0];
        return {
            id: monitor.id,
            url: monitor.url,
            interval: monitor.interval_seconds,
            status: "WAITING",
            createdAt: monitor.created_at
        };
    }
    catch (error) {
        console.error("Error creating monitor:", error);
        throw new CustomError(500, "Error creating monitor");
    }
    finally {
        client.release();
    }
};
export { createMonitorService };
