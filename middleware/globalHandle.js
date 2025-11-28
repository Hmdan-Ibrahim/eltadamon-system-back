export function globalHandle(err, req, res, next) {
    res.status(err.statusCode || 400)
        .json({
            statusCode: err.statusCode || 500,
            status: err.status || "error",
            message: err.message || err.error.message || "حدث خطأ في الخادم", err: err.error
        });
}
