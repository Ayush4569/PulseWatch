
class ApiResponse <T> {
    statusCode : number;
    message : string;
    data  : T | null;
    
    constructor(statusCode : number , message : string , data : T | null) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }

    public success (statusCode : number , message : string , data : T | null) : ApiResponse<T> {
        return new ApiResponse(statusCode , message , data);
    }

    public error (statusCode : number , message : string , data : T | null) : ApiResponse<T> {
        return new ApiResponse(statusCode , message , data);
    }

}