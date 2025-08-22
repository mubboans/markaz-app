export function errorHandler(err, req, res, next) {
    res.status(err?.code || 500).json({
        status: err.status || "error",
        message: err.message || "An unexpected error occurred.",
        success: false,
        data: null
    });
}

export function route_not_found(req, res, err) {
    sendResponse(req, res, {
        status: "error",
        message: "Route not found",
        code: 404,
        success: false,
    });
}

export function sendResponse(req,res,obj){
    console.log(obj,'check obj');
    
    return res.status(obj.code || 200).json(
        {
            status: obj.status || 'success',
            success: obj.success ?? true,
            data: obj.data || {},
            message: obj.message
        }
    )
}