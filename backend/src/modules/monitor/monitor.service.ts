import { CustomError } from "../../utils/apiError.js";
import pool from "../../db/client.js";
import { registerMonitorScheduler, removeMonitorScheduler } from "../../jobs/scheduler.js";
const createMonitorService = async (url: string, interval: number, userId: string) => {
    const client = await pool.connect();
    let monitorId: string | null = null;
    let isRegistered = false;
    try {
        await client.query("BEGIN");
        const result = await client.query(
            `INSERT INTO monitors
                (user_id, url, interval_seconds)
             VALUES
                ($1, $2, $3)
             RETURNING
                id,
                url,
                interval_seconds,
                is_active,
                created_at`,
            [userId, url, interval]
        );

        const monitor = result.rows[0];
        monitorId = monitor.id;

        await registerMonitorScheduler(monitor.id, monitor.interval_seconds);
        isRegistered = true;
        await client.query("COMMIT");
        return {
            id: monitor.id,
            url: monitor.url,
            interval: monitor.interval_seconds,
            status: "WAITING",
            createdAt: monitor.created_at
        };

    } catch (error) {
        await client.query("ROLLBACK");
        if (monitorId && isRegistered) {
            try {
                await removeMonitorScheduler(monitorId);
            } catch (cleanupError) {
                console.error(
                    "Failed to remove scheduler during cleanup:",
                    cleanupError
                );
            }
        }
        console.error("Error creating monitor:", error);

        throw new CustomError(
            500,
            "Error creating monitor"
        );
    } finally {
        client.release();
    }
}
const getMonitorsService = async (userId: string) => {
    const client = await pool.connect();

    try {
        const result = await client.query(
            `SELECT
                id,
                url,
                interval_seconds AS interval,
                is_active AS "isActive",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
             FROM monitors
             WHERE user_id = $1`,
            [userId]
        );

        return result.rows;
    } catch (error) {
        console.error(
            "Error fetching monitors configuration:",
            error
        );

        throw new CustomError(
            500,
            "Error fetching monitors configuration"
        );
    } finally {
        client.release();
    }
};
export {
    createMonitorService,
    getMonitorsService
}