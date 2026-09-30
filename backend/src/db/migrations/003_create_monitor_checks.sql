CREATE TABLE monitor_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    monitor_id UUID NOT NULL,

    status_code INTEGER,

    latency_ms INTEGER,

    success BOOLEAN NOT NULL,

    error_message TEXT,

    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (monitor_id) REFERENCES monitors(id)
);