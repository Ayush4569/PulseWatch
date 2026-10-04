import { Server } from "socket.io";

export const SOCKET_EVENTS = {
    MONITOR_CHECK:"monitor:check",
    INCIDENT_CREATED:"incident:created",
    INCIDENT_RESOLVED:"incident:resolved"
} as const;

export interface MonitorCheckPayload {
    monitorId: string;
    success: boolean;
    statusCode: number | null;
    userId: string;
    latencyMs: number;
    errorMessage: string | null;
    checkedAt: Date;
}
export interface IncidentCreatedPayload {
    monitorId: string;
    incidentId: string;
    failureReason: string;
    startedAt: Date;
}

export interface IncidentResolvedPayload {
    monitorId: string;
    incidentId: string;
    resolvedAt: Date;
}

const emitMonitorCheck = (io:Server,userId:string,data:MonitorCheckPayload)=> {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS['MONITOR_CHECK'],data);
}

const emitIncidentCreated = (io:Server,userId:string,data:IncidentCreatedPayload)=> {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS['INCIDENT_CREATED'],data);
}

const emitIncidentResolved = (io:Server,userId:string,data:IncidentResolvedPayload)=> {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS['INCIDENT_RESOLVED'],data);
}

export {
    emitIncidentCreated,
    emitMonitorCheck,
    emitIncidentResolved
}