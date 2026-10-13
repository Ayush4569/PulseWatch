export function formatLatency(ms: number | string | null | undefined): string {
  if (ms === null || ms === undefined) return "N/A";
  const num = typeof ms === "string" ? parseFloat(ms) : ms;
  if (isNaN(num)) return "N/A";
  return `${Math.round(num)}ms`;
}

export function formatUptime(uptime: number | string | null | undefined): string {
  if (uptime === null || uptime === undefined) return "N/A";
  const num = typeof uptime === "string" ? parseFloat(uptime) : uptime;
  if (isNaN(num)) return "N/A";
  return `${num.toFixed(2)}%`;
}

export function formatTimeAgo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "Never";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 5) return "just now";
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
  } catch {
    return url;
  }
}
