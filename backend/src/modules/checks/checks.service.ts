import pool from "../../db/client.js";
import { processIncident } from "../incidents/incident.service.js";

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

        const { url,userId } = monitor.rows[0];
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
        await processIncident({monitorId,success,errorMessage})
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

export {performHealthCheckService}