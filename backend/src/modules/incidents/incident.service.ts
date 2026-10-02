import pool from "../../db/client.js";

interface Incident {
    monitorId: string,
    success: boolean,
    errorMessage: string | null
}
const MAX_FAILURES = 3;

const processIncident = async ({ monitorId, success, errorMessage = "something went wrong" }: Incident) => {
    const client = await pool.connect();
    const reason = errorMessage ?? "Unknown error";
    try {
        if (success) {
            // update the incident record after a recovery
            await client.query(
                `UPDATE incidents SET resolved_at = NOW(), status='RESOLVED'
                 WHERE monitor_id=$1 AND status = 'OPEN'`,
                [monitorId]
            );
            return;
        }
        // Get the latest 3 checks for this monitor
        const result = await client.query(
            `SELECT success FROM monitor_checks WHERE monitor_id= $1 ORDER BY checked_at DESC LIMIT $2`, [monitorId, MAX_FAILURES]
        );

        if (result.rows.length < MAX_FAILURES) return;

        // check for consecutive flavor before creating a duplicate incident.
        const consecutiveFailures = result.rows.every(checks => checks.success == false);
        if (!consecutiveFailures) return;

        // Don't create another incident if one is already open
        const openIncident = await client.query(
            `SELECT id
             FROM incidents
             WHERE monitor_id = $1
               AND status = 'OPEN'
             LIMIT 1`,
            [monitorId]
        );

        if (openIncident.rows.length > 0) {
            return;
        }

        // Create new incident
        await client.query(
            `INSERT INTO incidents
                (monitor_id, failure_reason)
             VALUES
                ($1, $2)`,
            [monitorId, reason]
        );


    } catch (error) {
        console.log('Error processing incidents', error);
        throw error;
    } finally {
        client.release();
    }
}


export {
    processIncident
}