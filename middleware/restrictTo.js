export function restrictTo(...roles) {
    return (req, res, next) => {
        console.log(
            roles,
            roles.includes(req.user.role),
            req.user.role
        );

        if (!roles.includes(req.user.role)) {
            return next({ statusCode: 403, status: "forbidden", message: "ليس لديك حق الوصول الى هذا المورد" })
        }
        next()
    }
}

export function restrictFrom(...forbiddenRoles) {
    const excluded = forbiddenRoles.flat();

    return (req, res, next) => {
        if (excluded.includes(req.user?.role)) {
            return next({
                statusCode: 403,
                status: "forbidden",
                message: "ليس لديك حق الوصول إلى هذا المورد"
            });
        }
        next();
    };
}