export function errorHandler(err, req, res, next) {
    res.status(err?.code || 500).json({
        status: err.status || "error",
        message: err.message || "An unexpected error occurred.",
        success: false,
        data: null
    });
}

export function sendResponse(req,res,obj){
    return res.status(obj.code || 200).json(
        {
            status: obj.status || 'success',
            success: true,
            data: obj.data || {},
            message: obj.message
        }
    )
}