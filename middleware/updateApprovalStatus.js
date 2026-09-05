import { DailyOrder } from "../models/DailyOrder.js";
import { Roles } from "../util/Roles.js";
import { ApprovalStatus } from "../util/StatusOrder.js";
import { asyncWrapperMiddleware } from "./asyncWrapperMiddleware.js";

export const updateApprovalStatus = asyncWrapperMiddleware(async (req, res, next) => {

    const allowedRoles = [
        Roles.ADMIN,
        Roles.REGION_MANAGER
    ];

    if (!allowedRoles.includes(req.user.role)) {
        return next({
            statusCode: 403,
            status: "forbidden",
            message: "ليس لديك الصلاحية لاعتماد أو رفض الطلب"
        });
    }

    const order = await DailyOrder.findById(req.params.id).populate({
        path: "school",
        populate: {
            path: "project",
            select: "region"
        }
    });

    if (!order) {
        return next({
            statusCode: 404,
            status: "failed",
            message: "الطلب غير موجود"
        });
    }

    if (
        req.user.role === Roles.REGION_MANAGER &&
        order.school.project.region.toString() !== req.user.region.toString()
    ) {
        return next({
            statusCode: 403,
            status: "forbidden",
            message: "لا يمكنك اعتماد طلب خارج منطقتك"
        });
    }

    if (
        [ApprovalStatus.APPROVED, ApprovalStatus.REJCTED]
            .includes(order.ApprovalStatus)
    ) {
        return next({
            statusCode: 400,
            status: "failed",
            message: "تم اعتماد أو رفض الطلب مسبقاً"
        });
    }

    const { ApprovalStatus: newStatus } = req.body;
    if (
        ![
            ApprovalStatus.APPROVED,
            ApprovalStatus.REJCTED
        ].includes(newStatus)
    ) {
        return next({
            statusCode: 400,
            status: "failed",
            message: "حالة الاعتماد غير صحيحة"
        });
    }

    order.ApprovalStatus = newStatus;
    await order.save();

    res.status(203).json({
        status: "success", statusCode: 203, message:
            newStatus === ApprovalStatus.APPROVED
                ? "تم اعتماد الطلب بنجاح"
                : "تم رفض الطلب بنجاح",
    });
});