import { GoogleGenAI } from "@google/genai";
import pool from "../../db/client.js";
import { config } from "../../config/env.js";
import { CustomError } from "../../utils/apiError.js";

export interface TelemetrySummary {
    totalMonitors: number;
    activeMonitors: number;
    openIncidents: number;
    uptimePercent: number | null;
    avgLatencyMs: number | null;
    totalChecksAnalyzed: number;
}

export interface DashboardAiSummary {
    status: "HEALTHY" | "DEGRADED" | "CRITICAL" | "INSUFFICIENT_DATA";
    headline: string;
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    telemetry: TelemetrySummary;
    aiPowered: boolean;
    model?: string;
    generatedAt: string;
}

export const getDashboardAiSummaryService = async (
    userId: string
): Promise<DashboardAiSummary> => {
    const client = await pool.connect();
    try {
        const { rows: monitors } = await client.query(`
            SELECT 
                m.id,
                m.url,
                m.is_active,
                COUNT(mc.id) AS total_checks,
                COUNT(mc.id) FILTER (WHERE mc.success = true) AS successful_checks,
                AVG(mc.latency_ms) FILTER (WHERE mc.success = true) AS avg_latency,
                (SELECT mc2.success FROM monitor_checks mc2 WHERE mc2.monitor_id = m.id ORDER BY mc2.checked_at DESC LIMIT 1) AS last_status
            FROM monitors m
            LEFT JOIN monitor_checks mc ON mc.monitor_id = m.id
            WHERE m.user_id = $1
            GROUP BY m.id, m.url, m.is_active
            ORDER BY m.created_at DESC
        `, [userId]);


        const { rows: openIncidents } = await client.query(`
            SELECT i.id, m.url, i.failure_reason, i.started_at
            FROM incidents i
            JOIN monitors m ON m.id = i.monitor_id
            WHERE m.user_id = $1 AND i.status = 'OPEN'
        `, [userId]);

        const totalMonitors = monitors.length;
        const activeMonitors = monitors.filter((m) => m.is_active).length;
        let totalChecks = 0;
        let successfulChecks = 0;
        let latencySum = 0;
        let latencyCount = 0;

        for (const m of monitors) {
            const checks = parseInt(m.total_checks || "0", 10);
            const successes = parseInt(m.successful_checks || "0", 10);
            totalChecks += checks;
            successfulChecks += successes;

            if (m.avg_latency) {
                const avg = parseFloat(m.avg_latency);
                if (Number.isFinite(avg)) {
                    latencySum += avg * successes;
                    latencyCount += successes;
                }
            }
        }

        const uptimePercent =
            totalChecks > 0
                ? Math.round((successfulChecks / totalChecks) * 1000) / 10
                : null;

        const avgLatencyMs =
            latencyCount > 0
                ? Math.round(latencySum / latencyCount)
                : null;

        const telemetry: TelemetrySummary = {
            totalMonitors,
            activeMonitors,
            openIncidents: openIncidents.length,
            uptimePercent,
            avgLatencyMs,
            totalChecksAnalyzed: totalChecks,
        };

        if (totalMonitors === 0) {
            return {
                status: "INSUFFICIENT_DATA",
                headline: "No Monitored Endpoints",
                summary:
                    "You have not added any endpoints to monitor yet. Create your first monitor to start collecting uptime telemetry and AI-powered insights.",
                keyFindings: [
                    "Monitoring queue is empty",
                    "Add an endpoint to begin tracking uptime and latency",
                ],
                recommendations: [
                    "Click '+ New Monitor' to start tracking your first service.",
                ],
                telemetry,
                aiPowered: false,
                generatedAt: new Date().toISOString(),
            };
        }

        if (totalChecks === 0) {
            return {
                status: "INSUFFICIENT_DATA",
                headline: "Collecting Initial Telemetry",
                summary:
                    "Monitors have been configured and scheduled. Telemetry insights will generate as soon as initial health checks complete.",
                keyFindings: [
                    `${totalMonitors} monitor registered`,
                    "Initial health check queued with workers",
                ],
                recommendations: [
                    "Allow a few moments for the first health check cycle to complete.",
                ],
                telemetry,
                aiPowered: false,
                generatedAt: new Date().toISOString(),
            };
        }

        if (!config.GEMINI_API_KEY) {
            throw new CustomError(
                500,
                "GEMINI_API_KEY is not configured in backend environment."
            );
        }

        const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

        const prompt = 
        `You are PulseWatch's AI Telemetry Intelligence Engine.
        Analyze the following monitoring data:

        TELEMETRY DATA:
        - Total Monitors: ${totalMonitors} (Active: ${activeMonitors})
        - Fleet Uptime: ${uptimePercent}% (${successfulChecks}/${totalChecks} checks successful)
        - Fleet Average Latency: ${avgLatencyMs ?? "N/A"}ms
        - Open Incidents (${openIncidents.length}): ${JSON.stringify(
            openIncidents.map((i) => ({ url: i.url, reason: i.failure_reason }))
        )}
        - Endpoint Details: ${JSON.stringify(
            monitors.map((m) => ({
                url: m.url,
                totalChecks: parseInt(m.total_checks || "0", 10),
                uptime:
                    parseInt(m.total_checks || "0", 10) > 0
                        ? `${Math.round(
                              (parseInt(m.successful_checks || "0", 10) /
                                  parseInt(m.total_checks || "0", 10)) *
                                  100
                          )}%`
                        : "N/A",
                avgLatencyMs: m.avg_latency
                    ? Math.round(parseFloat(m.avg_latency))
                    : null,
                lastStatus:
                    m.last_status === true
                        ? "UP"
                        : m.last_status === false
                        ? "DOWN"
                        : "PENDING",
            }))
        )}

    INSTRUCTIONS:
    1. Ground all findings ONLY in the provided metrics. Do not fabricate URLs, incidents, or uptime numbers.
    2. Determine status:
    - "CRITICAL": Active open incidents or uptime < 95%
    - "DEGRADED": Intermittent failures, high latency (>300ms), or uptime between 95% and 99%
    - "HEALTHY": All monitors passing, 0 incidents, uptime >= 99%
    3. Return a JSON object with this exact structure:
    {
    "status": "HEALTHY" | "DEGRADED" | "CRITICAL",
    "headline": "A punchy 1-sentence executive status headline",
    "summary": "A concise 2-sentence technical summary covering availability, latency, and incident state",
    "keyFindings": ["Finding 1 with exact metrics", "Finding 2", "Finding 3"],
    "recommendations": ["Recommendation 1", "Recommendation 2"]
    }`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.2,
            },
        });

        const text = response.text;
        if (!text) {
            throw new CustomError(502, "Gemini API returned an empty response.");
        }

        const parsed = JSON.parse(text);

        return {
            status:
                parsed.status ||
                (openIncidents.length > 0 ? "CRITICAL" : "HEALTHY"),
            headline: parsed.headline || "Telemetry Analysis Complete",
            summary: parsed.summary || "All endpoints evaluated.",
            keyFindings: Array.isArray(parsed.keyFindings)
                ? parsed.keyFindings
                : [],
            recommendations: Array.isArray(parsed.recommendations)
                ? parsed.recommendations
                : [],
            telemetry,
            aiPowered: true,
            model: "Gemini 2.5 Flash",
            generatedAt: new Date().toISOString(),
        };
    } finally {
        client.release();
    }
};
