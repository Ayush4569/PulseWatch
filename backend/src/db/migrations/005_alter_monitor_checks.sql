ALTER TABLE monitor_checks
ADD COLUMN job_id TEXT;

CREATE UNIQUE INDEX idx_monitor_checks_job_id
ON monitor_checks(job_id)
WHERE job_id IS NOT NULL;