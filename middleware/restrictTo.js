export function restrictTo(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next({ statusCode: 403, status: "forbiddin", message: "ليس لديك حق الوصول الى هذا المورد" })
        }
        next()
    }
}