import pool from "../../db/client.js";
import { CustomError } from "../../utils/apiError.js";
import { publishIncidentCreated, publishIncidentResolved } from "../../websocket/publisher.js";
interface Incident {
  userId: string
  monitorId: string,
  success: boolean,
  errorMessage: string | null
}


const MAX_FAILURES = 3;

const processIncident = async ({
  userId,
  monitorId,
  success,
  errorMessage,
}: Incident) => {
  const client = await pool.connect();

  const reason = errorMessage ?? "Unknown error";

  try {
    // Recovery: resolve any open incident for this monitor.
    if (success) {
      const result = await client.query(
        `UPDATE incidents
         SET resolved_at = NOW(),
             status = 'RESOLVED'
         WHERE monitor_id = $1
           AND status = 'OPEN'
         RETURNING id, resolved_at AS "resolvedAt"`,
        [monitorId]
      );

      // No open incident means there is nothing to resolve.
      if (result.rows.length === 0) return;

      for (const incident of result.rows) {
        await publishIncidentResolved(userId, {
          incidentId: incident.id,
          monitorId,
          resolvedAt: incident.resolvedAt,
        });
      }

      return;
    }

    // Failure: fetch the latest three checks.
    const checksResult = await client.query(
      `SELECT success
       FROM monitor_checks
       WHERE monitor_id = $1
       ORDER BY checked_at DESC, id DESC
       LIMIT $2`,
      [monitorId, MAX_FAILURES]
    );

    if (checksResult.rows.length < MAX_FAILURES) return;

    const consecutiveFailures = checksResult.rows.every(
      (check) => check.success === false
    );

    if (!consecutiveFailures) return;

    // Don't create another incident if one is already open.
    const openIncident = await client.query(
      `SELECT id
       FROM incidents
       WHERE monitor_id = $1
         AND status = 'OPEN'
       LIMIT 1`,
      [monitorId]
    );

    if (openIncident.rows.length > 0) return;

    // Create the incident and retrieve its actual database ID.
    const insertResult = await client.query(
      `INSERT INTO incidents (monitor_id, failure_reason)
       VALUES ($1, $2)
       RETURNING id, started_at AS "startedAt"`,
      [monitorId, reason]
    );

    if (insertResult.rows.length === 0) return;

    const incident = insertResult.rows[0];

    await publishIncidentCreated(userId, {
      incidentId: incident.id,
      monitorId,
      failureReason: reason,
      startedAt: incident.startedAt,
    });
  } catch (error) {
    console.error("Error processing incidents:", error);
    throw error;
  } finally {
    client.release();
  }
};


type IncidentStatus = "OPEN" | "RESOLVED";

interface GetIncidentsOptions {
  page: number;
  limit: number;
  status?: IncidentStatus;
}

const getIncidentsService = async (
  userId: string,
  { page, limit, status }: GetIncidentsOptions
) => {
  const client = await pool.connect();

  try {
    const offset = (page - 1) * limit;

    const values: (string | number)[] = [userId];
    let statusFilter = "";

    if (status) {
      values.push(status);
      statusFilter = `AND i.status = $${values.length}`;
    }

    const countResult = await client.query(
      `SELECT COUNT(*)::int AS total
       FROM incidents i
       JOIN monitors m ON m.id = i.monitor_id
       WHERE m.user_id = $1
       ${statusFilter}`,
      values
    );

    const total: number = countResult.rows[0].total;

    const dataValues = [...values, limit, offset];
    const limitPlaceholder = dataValues.length - 1;
    const offsetPlaceholder = dataValues.length;

    const incidentsResult = await client.query(
      `SELECT
         i.id,
         i.monitor_id AS "monitorId",
         m.url AS "monitorUrl",
         i.started_at AS "startedAt",
         i.resolved_at AS "resolvedAt",
         i.status,
         i.failure_reason AS "failureReason"
       FROM incidents i
       JOIN monitors m ON m.id = i.monitor_id
       WHERE m.user_id = $1
       ${statusFilter}
       ORDER BY i.started_at DESC, i.id DESC
       LIMIT $${limitPlaceholder}
       OFFSET $${offsetPlaceholder}`,
      dataValues
    );

    return {
      incidents: incidentsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    if (error instanceof CustomError) throw error;

    console.error("Error fetching incidents:", error);
    throw new CustomError(500, "Failed to fetch incidents");
  } finally {
    client.release();
  }
};

const getIncidentByIdService = async (
  userId: string,
  incidentId: string
) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT
         i.id,
         i.monitor_id AS "monitorId",
         m.url AS "monitorUrl",
         i.started_at AS "startedAt",
         i.resolved_at AS "resolvedAt",
         i.status,
         i.failure_reason AS "failureReason"
       FROM incidents i
       JOIN monitors m ON m.id = i.monitor_id
       WHERE i.id = $1 AND m.user_id = $2`,
      [incidentId, userId]
    );

    if (result.rows.length === 0) {
      throw new CustomError(404, "Incident not found");
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof CustomError) throw error;

    console.error("Error fetching incident:", error);
    throw new CustomError(500, "Failed to fetch incident");
  } finally {
    client.release();
  }
};



export {
  processIncident,
  getIncidentsService,
  getIncidentByIdService
}