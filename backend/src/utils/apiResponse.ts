class ApiResponse <T> {
    statusCode : number;
    message : string;
    data  : T | null;
    success : boolean
    
    constructor(statusCode : number , message : string , data : T | null) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode >= 200 && statusCode < 300;
    }
}

export default ApiResponse