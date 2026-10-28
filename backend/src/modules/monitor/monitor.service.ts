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
      `
      SELECT
        m.id,
        m.url,
        m.interval_seconds AS interval,
        m.is_active AS "isActive",
        m.created_at AS "createdAt",
        m.updated_at AS "updatedAt",

        CASE
          WHEN latest.id IS NULL THEN 'WAITING'
          WHEN latest.success = false THEN 'DOWN'
          WHEN latest.success = true THEN 'UP'
          ELSE 'WAITING'
        END AS "lastStatus",

        latest.latency_ms AS "lastLatencyMs",
        latest.checked_at AS "lastCheckedAt",
        latest.error_message AS "lastErrorMessage",

        analytics.uptime AS uptime

      FROM monitors m

      LEFT JOIN LATERAL (
        SELECT
          mc.id,
          mc.success,
          mc.latency_ms,
          mc.checked_at,
          mc.error_message
        FROM monitor_checks mc
        WHERE mc.monitor_id = m.id
        ORDER BY mc.checked_at DESC
        LIMIT 1
      ) latest ON true

      LEFT JOIN LATERAL (
        SELECT
          (
            COUNT(*) FILTER (
              WHERE mc.success = true
            ) * 100.0 / NULLIF(COUNT(*), 0)
          )::double precision AS uptime
        FROM monitor_checks mc
        WHERE mc.monitor_id = m.id
          AND mc.checked_at >= NOW() - INTERVAL '24 hours'
      ) analytics ON true

      WHERE m.user_id = $1

      ORDER BY m.created_at DESC
      `,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error("Error fetching monitors:", error);

    throw new CustomError(
      500,
      "Error fetching monitors"
    );
  } finally {
    client.release();
  }
};

const getMonitorDetailsService = async (userId: string, monitorId: string) => {
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
             WHERE user_id = $1 AND id = $2`,
            [userId, monitorId]
        );
        if (result.rows.length == 0) {
            throw new CustomError(404, "Monitor not found")
        }
        return result.rows[0];
    } catch (error) {
        if (error instanceof CustomError) {
            throw error;
        }
        console.error(
            "Error fetching monitor details",
            error
        );

        throw new CustomError(
            500,
            "Error fetching monitor details"
        );
    } finally {
        client.release();
    }
}
const updateMontiorService = async (
    { url, interval }: { url: string, interval: number },
    userId: string,
    monitorId: string
) => {
    const client = await pool.connect();

    try {
        const monitor = await client.query(
            `SELECT id from monitors WHERE id=$1 AND user_id=$2`,
            [monitorId, userId]
        )

        if (monitor.rows.length == 0) {
            throw new CustomError(404, "Monitor not found")
        }
        const newUrl = url ?? monitor.rows[0].url;
        const newInterval = interval ?? monitor.rows[0].interval_seconds;
        const isIntervalChanged = newInterval != monitor.rows[0].interval_seconds;

        const result = await client.query(
            `UPDATE monitors
       SET url = $1,
           interval_seconds = $2,
           updated_at = NOW()
       WHERE id = $3
         AND user_id = $4
       RETURNING
         id,
         url,
         interval_seconds AS interval,
         is_active AS "isActive",
         created_at AS "createdAt",
         updated_at AS "updatedAt"`,
            [newUrl, newInterval, monitorId, userId]
        );

        if (result.rowCount === 0) {
            throw new CustomError(404, "Monitor not found");
        }

        const updatedMonitor = result.rows[0];

        if (isIntervalChanged && updatedMonitor.isActive) {
            await removeMonitorScheduler(monitorId);
            await registerMonitorScheduler(monitorId, updatedMonitor.interval);
        }

        return updatedMonitor;
    } catch (error) {
        if (error instanceof CustomError) {
            throw error;
        }

        console.error("Error updating monitor:", error);

        throw new CustomError(500, "Error updating monitor");
    } finally {
        client.release();
    }
};
const deleteMonitorService = async (userId: string, monitorId: string) => {
    const client = await pool.connect();
    let transactionStarted = false;
    let schedulerDeleted = false;
    let rollbackSucceeded = true;

    let monitorForRecovery: {
        interval_seconds: number;
        is_active: boolean;
    } | null = null;
    try {
        await client.query("BEGIN");
        transactionStarted = true;

        const monitorResult = await client.query(
            `SELECT interval_seconds, is_active
       FROM monitors
       WHERE id = $1 AND user_id = $2
       FOR UPDATE`,
            [monitorId, userId]
        );

        if (monitorResult.rows.length === 0) {
            throw new CustomError(404, "Monitor not found");
        }
        monitorForRecovery = monitorResult.rows[0];
        // remove the job from queue
        await removeMonitorScheduler(monitorId);
        schedulerDeleted = true;
        // start a transaction & delete incidents and checks from db for the given monitor

        await client.query(`DELETE FROM monitor_checks WHERE monitor_id=$1`, [monitorId]);

        await client.query(`DELETE FROM incidents WHERE monitor_id=$1`, [monitorId]);

        const deleteResult = await client.query(
            `DELETE FROM monitors
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
            [monitorId, userId]
        );

        if (deleteResult.rows.length === 0) {
            throw new CustomError(404, "Monitor not found");
        }

        await client.query("COMMIT");
        transactionStarted = false;

    } catch (error) {
        if (transactionStarted) {
            try {
                await client.query("ROLLBACK");
                transactionStarted = false;
            } catch (rollBackError) {
                rollbackSucceeded = false;
                console.error(
                    "Failed to roll back monitor deletion:",
                    rollBackError
                );
            }
        }
        if (schedulerDeleted && rollbackSucceeded && monitorForRecovery?.is_active) {
            // Restore the scheduler if deletion failed after its removal
            try {
                await registerMonitorScheduler(
                    monitorId,
                    monitorForRecovery.interval_seconds
                );
            } catch (recoveryError) {
                console.error(
                    "Failed to restore monitor scheduler:",
                    recoveryError
                );
            }
        }
        if (error instanceof CustomError) {
            throw error;
        }
        console.error(
            "Error deleting monitor",
            error
        );

        throw new CustomError(
            500,
            "Error deleting monitor"
        );

    } finally {
        client.release()
    }
}
const toggleMonitorStatusService = async (
  userId: string,
  monitorId: string,
  isActive: boolean
) => {
  const client = await pool.connect();

  try {
    
    const result = await client.query(
      `UPDATE monitors
       SET is_active = $1,
           updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING
         id,
         url,
         is_active AS "isActive",
         interval_seconds AS interval`,
      [isActive, monitorId, userId]
    );

    if (result.rows.length === 0) {
      throw new CustomError(404, "Monitor not found");
    }

    const updatedMonitor = result.rows[0];

    if (updatedMonitor.isActive) {
      await registerMonitorScheduler(
        updatedMonitor.id,
        updatedMonitor.interval
      );
    } else {
      await removeMonitorScheduler(updatedMonitor.id);
    }

    return updatedMonitor;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }

    console.error("Error updating monitor status:", error);

    throw new CustomError(500, "Error updating monitor status");
  } finally {
    client.release();
  }
};
export {
    createMonitorService,
    getMonitorsService,
    getMonitorDetailsService,
    updateMontiorService,
    deleteMonitorService,
    toggleMonitorStatusService
}