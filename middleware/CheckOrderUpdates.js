import { DailyOrder } from "../models/DailyOrder.js";
import { Roles } from "../util/Roles.js";
import { ApprovalStatus } from "../util/StatusOrder.js"
import { asyncWrapperMiddleware } from "./asyncWrapperMiddleware.js"

export const CheckOrderUpdates = asyncWrapperMiddleware(async (req, res, next) => {

    const isAdmin = Roles.ADMIN === req.user.role
    const isApprovalStatus =
        [ApprovalStatus.APPROVED, ApprovalStatus.REJCTED]
            .includes(req.body.ApprovalStatus);

    if (isApprovalStatus) {
        return next({
            statusCode: 403,
            status: "forbidden",
            message: "ليس لديك الصلاحية لاعتماد او رفض الطلب"
        });
    }

    const order = await DailyOrder.findById(req.params.id);
    if (!order) {
        return next({
            statusCode: 404,
            status: "failed",
            message: "الطلب غير موجود"
        });
    }
    if ([ApprovalStatus.APPROVED, ApprovalStatus.REJCTED].includes(order.ApprovalStatus) && !isAdmin) {
        return next({
            statusCode: 403,
            status: "forbidden",
            message: "لايمكن تحديث بيانات الطلب بعد الاعتماد او الرفض"
        });
    }

    next()
})