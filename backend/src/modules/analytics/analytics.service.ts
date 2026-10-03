import pool from "../../db/client.js";
import { CustomError } from "../../utils/apiError.js";

const getAllMonitorsAnalyticsQuery = `
    SELECT
        m.id AS monitor_id,

        COUNT(mc.id) AS "totalChecks",

        COUNT(mc.id) FILTER (
            WHERE mc.success = true
        ) AS "successfulChecks",

        COUNT(mc.id) FILTER (
            WHERE mc.success = false
        ) AS "failedChecks",

        AVG(mc.latency_ms) AS "avgLatency",

        MIN(mc.latency_ms) AS "minLatency",

        MAX(mc.latency_ms) AS "maxLatency",

        CASE
            WHEN COUNT(mc.id) = 0 THEN NULL
            ELSE (
                COUNT(mc.id) FILTER (
                    WHERE mc.success = true
                ) * 100.0 / COUNT(mc.id)
            )
        END AS uptime

    FROM monitors m

    LEFT JOIN monitor_checks mc
        ON mc.monitor_id = m.id
        AND mc.checked_at >= NOW() - INTERVAL '24 hours'

    WHERE m.user_id = $1

    GROUP BY m.id
`;

const getMonitorAnalyticsQuery = `
    SELECT
        mc.monitor_id,

        COUNT(*) AS "totalChecks",

        COUNT(*) FILTER (
            WHERE mc.success = true
        ) AS "successfulChecks",

        COUNT(*) FILTER (
            WHERE mc.success = false
        ) AS "failedChecks",

        AVG(mc.latency_ms) AS "avgLatency",

        MIN(mc.latency_ms) AS "minLatency",

        MAX(mc.latency_ms) AS "maxLatency",

        (
            COUNT(*) FILTER (
                WHERE mc.success = true
            ) * 100.0 / NULLIF(COUNT(*), 0)
        ) AS uptime

    FROM monitor_checks mc

    JOIN monitors m
        ON m.id = mc.monitor_id

    WHERE mc.monitor_id = $1
      AND m.user_id = $2
      AND mc.checked_at >= NOW() - INTERVAL '24 hours'

    GROUP BY mc.monitor_id
`;

const getAllMonitorsAnalytics = async (userId: string) => {
    const client = await pool.connect();

    try {
        const result = await client.query(
            getAllMonitorsAnalyticsQuery,
            [userId]
        );

        return result.rows;

    } catch (error) {
        console.error(
            "Error generating analytics:",
            error
        );

        throw new CustomError(
            500,
            "Error generating analytics"
        );

    } finally {
        client.release();
    }
};

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
    getAllMonitorsAnalytics,
    getMonitorAnalytics
};