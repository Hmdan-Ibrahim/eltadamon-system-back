import jwt from "jsonwebtoken"
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) return next({
        status: "un authenticated",
        statusCode: 401,
        message: "أنت لم تسجل الدخول, من فضلك سجل الدخول!"
    })

    const decoded = jwt.decode(token); // نفك التوكن بدون التحقق
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
        return next(
            {
                status: "failed",
                statusCode: 401,
                message: "المستخدم المرتبط بهذا الرمز لم يعد موجودًا!"
            }
        );
    }

    const decoded2 = jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decode) => {
        if (err) {
            if (err.name === "TokenExpiredError") {

                await User.updateOne({ _id: decoded.userId }, { isLogining: false })
                return next(
                    {
                        status: "forbiddin",
                        statusCode: 401,
                        message: "انتهت صلاحية تسجيل الدخول."
                        , error: err
                    }
                );
            } else {
                return next(
                    {
                        status: "forbiddin",
                        statusCode: 401,
                        message: err.message
                        , error: err
                    })
            }
        }
        req.user = currentUser
        next()
    })
}