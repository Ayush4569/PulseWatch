import pool from "../../db/client.js";
import { CustomError } from "../../utils/apiError.js";
import { processIncident } from "../incidents/incident.service.js";

type duration = '1h' | '6h' | '24h' | '3d'

const durationInSeconds: Record<duration, number> = {
    "1h": 60 * 60,
    "6h": 6 * 60 * 60,
    "24h": 24 * 60 * 60,
    "3d": 3 * 24 * 60 * 60,
}

const performHealthCheckService = async (monitorId: string, jobId: string) => {
    if (!monitorId) {
        throw new Error("Monitor ID is required");
    }

    const monitorResult = await pool.query(
        `
      SELECT
        url,
        user_id AS "userId",
        is_active AS "isActive"
      FROM monitors
      WHERE id = $1
    `,
        [monitorId]
    );

    if (
        monitorResult.rows.length === 0 ||
        !monitorResult.rows[0].isActive
    ) {
        return null;
    }

    const { url, userId } = monitorResult.rows[0];

    const startTime = Date.now();

    let statusCode: number | null = null;
    let success = false;
    let errorMessage: string | null = null;

    try {
        const response = await fetch(url, {
            method: "GET",
            signal: AbortSignal.timeout(10000),
            headers: {
                "User-Agent": "PulseWatch-Bot/1.0 (+https://pulsewatch.dev)",
                "Accept": "*/*",
            },
        });
        if (!response.ok) {
            errorMessage = response.statusText || `HTTP ${response.status}`;
        }
        statusCode = response.status;
        success = response.ok;
        await response.body?.cancel();
    } catch (error) {
        errorMessage =
            error instanceof Error ? error.message : "Unknown error";
    }

    const latency = Date.now() - startTime;

    const client = await pool.connect();

    try {
        const insertResult = await client.query(
            `
        INSERT INTO monitor_checks
        (monitor_id,status_code,latency_ms,success,error_message,job_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (job_id)
        WHERE job_id IS NOT NULL
        DO NOTHING
        RETURNING
            id,
            monitor_id AS "monitorId",
            status_code AS "statusCode",
            latency_ms AS "latencyMs",
            success,
            error_message AS "errorMessage",
            checked_at AS "checkedAt";
      `,
            [monitorId, statusCode, latency, success, errorMessage, jobId]
        );
        const check = insertResult.rows[0];

        if (!check) {
            console.log(`Check already processed for job ${jobId}`);
            return null;
        }
        await processIncident(
            client,
            {
                userId,
                monitorId,
                success,
                errorMessage,
            });

        const uptimeResult = await client.query(
            `SELECT (COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0))::double precision AS uptime
             FROM monitor_checks
             WHERE monitor_id = $1`,
            [monitorId]
        );

        const uptime = uptimeResult.rows[0]?.uptime != null
            ? Number(uptimeResult.rows[0].uptime)
            : (success ? 100 : 0);

        return {
            ...check,
            userId,
            uptime,
        };
    } catch (error: any) {
        if (error?.code === "23503") {
            console.warn(`Monitor ${monitorId} was deleted. Discarding check.`);
            return null;
        }

        console.error("Failed to persist health check:", error);
        throw error;
    } finally {
        client.release();
    }
};
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
            `SELECT
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
             ORDER BY checked_at ASC
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