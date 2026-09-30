import { performHealthCheckService } from "./checks.service.js";

const monitorId = "0eef8f80-3b20-4735-8a07-77dda2a46067";

const result = await performHealthCheckService(monitorId);

console.log("Health check result:");
console.log(result);