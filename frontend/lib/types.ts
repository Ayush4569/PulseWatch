export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T | null;
  success: boolean;
}

export interface Monitor {
  id: string;
  url: string;
  interval: number; // in seconds (30, 60, 300)
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastStatus?: "UP" | "DOWN" | "DEGRADED" | "WAITING";
  lastLatencyMs?: number | null;
  lastCheckedAt?: string | null;
  lastErrorMessage?: string | null;
  hasActiveIncident?: boolean;
  uptime?: number | null;
}

export interface CreateMonitor {
  id: string;
  url: string;
  interval: number;
  createdAt: string;
  status: "UP" | "DOWN" | "DEGRADED" | "WAITING";
}

export interface MonitorAnalytics {
  monitor_id: string;
  totalChecks: string | number;
  successfulChecks: string | number;
  failedChecks: string | number;
  avgLatency: string | number | null;
  minLatency: number | null;
  maxLatency: number | null;
  uptime: string | number | null;
}

export interface IncidentItem {
  id: string;
  monitorId: string;
  monitorUrl?: string;
  failureReason: string;
  startedAt: string;
  resolvedAt?: string | null;
  status: "OPEN" | "RESOLVED";
}

export interface MonitorCheckEvent {
  monitorId: string;
  success: boolean;
  statusCode: number | null;
  userId: string;
  latencyMs: number;
  errorMessage: string | null;
  checkedAt: string;
}

export interface IncidentCreatedEvent {
  monitorId: string;
  incidentId: string;
  failureReason: string;
  startedAt: string;
}

export interface IncidentResolvedEvent {
  monitorId: string;
  incidentId: string;
  resolvedAt: string;
}

export const SOCKET_EVENTS = {
  MONITOR_CHECK: "monitor:check",
  INCIDENT_CREATED: "incident:created",
  INCIDENT_RESOLVED: "incident:resolved",
} as const;
