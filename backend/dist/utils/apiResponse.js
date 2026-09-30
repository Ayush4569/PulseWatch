class ApiResponse {
    statusCode;
    message;
    data;
    success;
    constructor(statusCode, message, data) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode >= 200 && statusCode < 300;
    }
}
export default ApiResponse;
