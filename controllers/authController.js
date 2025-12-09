import { asyncWrapperMiddleware } from "../middleware/asyncWrapperMiddleware.js";
import { User } from "../models/User.js";
import { notFoundError } from "../util/ErrorsMessages.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
    expiresIn: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 1000 * 60 * 60 * 24),
    secure: false,
    httpOnly: true,
    // sameSite: "strict",
}

export const login = asyncWrapperMiddleware(async (req, res, next) => {
    const { userName, password } = req.body

    const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] || // إذا السيرفر خلف بروكسي
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress;

    if (!userName || !password) {
        return next({ statusCode: 400, status: "fiald", message: "ادخل اسم المستخدم وكلمة المرور!" })
    }

    const user = await User.findOne({ userName }).select("+password");

    if (!user) {
        return next({ statusCode: 404, status: "failed", message: notFoundError("المستخدم") });
    }

    if (!user || !await user.correctPassword(password)) {
        return next({
            statusCode: 401,
            status: "failed",
            message: "اسم المستخدم أو كلمة المرور غير صحيحة!",
        });
    }

    if (user.isLogining) {
        if (
            user.userAgent !== req.headers["user-agent"] ||
            user?.deviceIp != ip
        ) {
            return next({
                statusCode: 403,
                status: "failed",
                message: "المستخدم مسجل الدخول من جهاز آخر. يرجى تسجيل الخروج أولاً!",
            });
        }
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: 1980 })
    const { _id, name, phone, role, region, project } = user

    await User.updateOne({ _id }, { isLogining: true, userAgent: req.headers['user-agent'], deviceIp: ip })

    res.cookie("jwt_access_token", token, cookieOptions)

    res.status(200).json({
        status: "success",
        statusCode: 200,
        message: "تم تسجيل الدخول بنجاح.",
        data: {
            token,
            user: { _id, name, phone, role, region, project }
        }
    });
})

export const logout = asyncWrapperMiddleware(async (req, res) => {
    await User.updateOne({ _id: req.user._id }, { isLogining: false })

    res.status(200).json({
        status: "success",
        statusCode: 200,
        message: "تم تسجيل الخروج بنجاح.",
    });
})
