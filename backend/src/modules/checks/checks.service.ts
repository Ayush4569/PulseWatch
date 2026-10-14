import pool from "../../db/client.js";
import { CustomError } from "../../utils/apiError.js";
import { processIncident } from "../incidents/incident.service.js";

type duration = '1h' | '6h' | '24h' | '3d'

const durationInSeconds: Record<duration, number> = {
    "1h": 60 * 60,
    "6h": 6 * 60 * 60,
    "24h": 24 * 60 * 60,
    "3d": 2 * 24 * 60 * 60,
}

const performHealthCheckService = async (monitorId: string) => {
    if (!monitorId) {
        throw new Error("Monitor ID is required")
    }
    const client = await pool.connect();
    try {
        const monitor = await client.query(
            `SELECT url,user_id AS "userId" FROM monitors WHERE id = $1`,
            [monitorId]
        )
        if (monitor.rows.length === 0) {
            throw new Error("Monitor not found")
        }

        const { url, userId } = monitor.rows[0];
        const startTime = Date.now();

        let statusCode: number | null = null;
        let success = false;
        let errorMessage: string | null = null;

        try {
            const response = await fetch(url, {
                method: "GET",
                signal: AbortSignal.timeout(10000)
            });

            statusCode = response.status;
            success = response.ok;

            if (!response.ok) errorMessage = response.statusText;
        } catch (error) {
            errorMessage = error instanceof Error ? error.message : "Unknown error";
        }

        const latency = Date.now() - startTime;

        const insertResult = await client.query(
            `
    INSERT INTO monitor_checks
        (monitor_id, status_code, latency_ms, success, error_message)
    VALUES
        ($1, $2, $3, $4, $5)
    RETURNING
        monitor_id AS "monitorId",
        status_code AS "statusCode",
        latency_ms AS "latencyMs",
        success,
        error_message AS "errorMessage",
        checked_at AS "checkedAt"
    `,
            [monitorId, statusCode, latency, success, errorMessage]
        );
        await processIncident({ monitorId, success, errorMessage })
        return {
            ...insertResult.rows[0],
            userId
        }
    } catch (error) {
        console.error("Failed to perform health check:", error);
        throw error;
    } finally {
        client.release();
    }

}
const getMonitorCheckService = async (monitorId: string, userId: string, page: number, limit: number) => {
    const client = await pool.connect();
    try {
        const monitorResult = await client.query(
            `SELECT id
         FROM monitors
         WHERE id = $1 AND user_id = $2`,
            [monitorId, userId]
        );

        if (monitorResult.rows.length === 0) {
            throw new CustomError(404, "Monitor not found");
        }
        const offset = (page - 1) * limit;

        const checksResult = await client.query(
            `         SELECT
            id,
            monitor_id AS "monitorId",
            status_code AS "statusCode",
            latency_ms AS "latencyMs",
            success,
            error_message AS "errorMessage",
            checked_at AS "checkedAt"
            FROM monitor_checks
            WHERE monitor_id = $1
            ORDER BY checked_at DESC, id DESC
            LIMIT $2 OFFSET $3`,
            [monitorId, limit, offset]);

        const countResult = await client.query(
            `SELECT COUNT(*)::int AS total
             FROM monitor_checks
             WHERE monitor_id = $1`,
            [monitorId]
        );

        const total = countResult.rows[0].total;

        return {
            checks: checksResult.rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }

    } catch (error) {
        if (error instanceof CustomError) {
            throw error;
        }
        console.error("Error fetching monitor checks:", error);
        throw new CustomError(500, "Failed to fetch monitor checks");
    } finally {
        client.release();
    }
}
const getMonitorCheckSeriesService = async (monitorId: string, userId: string, range: duration = '1h') => {
    const client = await pool.connect();
    try {
        const monitorResult = await client.query(
            `SELECT id
         FROM monitors
         WHERE id = $1 AND user_id = $2`,
            [monitorId, userId]
        );

        if (monitorResult.rows.length === 0) {
            throw new CustomError(404, "Monitor not found");
        }
        const seconds = durationInSeconds[range];
        const checkResult = await client.query(
            `SELECT
             status_code as "statusCode",
             latency_ms as "latencyMs",
             success,
             checked_at as "checkedAt"
             FROM monitor_checks WHERE monitor_id=$1
             AND checked_at >= NOW() - make_interval(secs=> $2:: double precision)
             ORDER BY checked_at ASC, 
             `, [monitorId, seconds]
        );

        return {
            range,
            hasData: checkResult.rows.length > 0,
            points: checkResult.rows,
        };
    } catch (error) {
        if (error instanceof CustomError) {
            throw error;
        }
        console.error("Error fetching monitor check series:", error);
        throw new CustomError(500, "Failed to fetch monitor check series");
    } finally {
        client.release();
    }
}
export {
    performHealthCheckService,
    getMonitorCheckService,
    getMonitorCheckSeriesService
}