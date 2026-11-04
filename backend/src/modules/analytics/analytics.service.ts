import pool from "../../db/client.js";
import { CustomError } from "../../utils/apiError.js";


const getMonitorAnalyticsQuery = `
   SELECT
    m.id AS monitor_id,
    m.url,
    m.interval_seconds AS interval,
    MAX(mc.checked_at) AS "lastCheckedAt",
    COUNT(mc.id) AS "totalChecks",
    COUNT(mc.id) FILTER (WHERE mc.success = true) AS "successfulChecks",
    COUNT(mc.id) FILTER (WHERE mc.success = false) AS "failedChecks",
    AVG(mc.latency_ms) AS "avgLatency",
    MIN(mc.latency_ms) AS "minLatency",
    MAX(mc.latency_ms) AS "maxLatency",
    (COUNT(mc.id) FILTER (WHERE mc.success = true) * 100.0 / NULLIF(COUNT(mc.id), 0)) AS uptime
    FROM monitors m
    LEFT JOIN monitor_checks mc ON mc.monitor_id = m.id
    WHERE m.id = $1 AND m.user_id = $2
    GROUP BY m.id, m.url, m.interval_seconds
`;

const getMonitorAnalytics = async (
    monitorId: string,
    userId: string
) => {
    const client = await pool.connect();

    try {
        const result = await client.query(
            getMonitorAnalyticsQuery,
            [monitorId, userId]
        );

        return result.rows[0] ?? null;

    } catch (error) {
        console.error(
            `Error generating analytics for monitor ${monitorId}:`,
            error
        );

        throw new CustomError(
            500,
            "Error generating monitor analytics"
        );

    } finally {
        client.release();
    }
};

export {
    getMonitorAnalytics
};