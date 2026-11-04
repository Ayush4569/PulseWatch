CREATE INDEX idx_monitor_checks_monitor_checked_at 
ON monitor_checks (monitor_id, checked_at DESC);

CREATE INDEX idx_monitors_user_id 
ON monitors (user_id);

CREATE UNIQUE INDEX idx_unique_open_incident_per_monitor    
ON incidents (monitor_id)
WHERE status = 'OPEN';