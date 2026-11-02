import {  IncidentItem, MonitorCheckEvent } from "./types";


export const MOCK_RECENT_CHECKS: MonitorCheckEvent[] = [
  {
    monitorId: "mon-1",
    success: true,
    statusCode: 200,
    userId: "user-123",
    latencyMs: 142,
    errorMessage: null,
    checkedAt: new Date(Date.now() - 1000 * 15).toISOString(),
  },
  {
    monitorId: "mon-2",
    success: true,
    statusCode: 200,
    userId: "user-123",
    latencyMs: 88,
    errorMessage: null,
    checkedAt: new Date(Date.now() - 1000 * 45).toISOString(),
  },
  {
    monitorId: "mon-3",
    success: false,
    statusCode: 500,
    userId: "user-123",
    latencyMs: 512,
    errorMessage: "HTTP 500 Internal Server Error",
    checkedAt: new Date(Date.now() - 1000 * 90).toISOString(),
  },
  {
    monitorId: "mon-4",
    success: true,
    statusCode: 200,
    userId: "user-123",
    latencyMs: 480,
    errorMessage: null,
    checkedAt: new Date(Date.now() - 1000 * 140).toISOString(),
  },
];

export const MOCK_INCIDENTS: IncidentItem[] = [
  {
    id: "inc-101",
    monitorId: "mon-3",
    failureReason: "HTTP 500 Internal Server Error — Connection refusal on database pool.",
    startedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    status: "OPEN",
  },
  {
    id: "inc-100",
    monitorId: "mon-2",
    failureReason: "Gateway Timeout (504)",
    startedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 165).toISOString(),
    status: "RESOLVED",
  },
];
