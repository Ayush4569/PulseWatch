CREATE TYPE incident_status AS ENUM ('OPEN','RESOLVED');

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    status incident_status NOT NULL DEFAULT 'OPEN',
    failure_reason TEXT NOT NULL,
    FOREIGN KEY (monitor_id) REFERENCES monitors(id)
);

CREATE INDEX idx_incidents_monitor_id
ON incidents(monitor_id);

CREATE INDEX idx_incidents_status
ON incidents(status);