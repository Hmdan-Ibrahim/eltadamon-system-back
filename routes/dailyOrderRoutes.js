import { Router } from "express";
import { createDailyOrder, createPowerPoint, deleteDailyOrder, getAllDailyOrders, getDailyOrder, getDailyOrdersByProject, updateDailyOrder } from "../controllers/dailyOrderController.js";
import { protect } from "../middleware/protect.js";
import { restrictFrom, restrictTo } from "../middleware/restrictTo.js";
import { Roles } from "../util/Roles.js";
import { CheckOrderUpdates } from "../middleware/CheckOrderUpdates.js";
import { updateApprovalStatus } from "../middleware/updateApprovalStatus.js";

const dailyOrderRouter = Router();

dailyOrderRouter.use(protect)

dailyOrderRouter.route("/")
    .get(getAllDailyOrders)
    .post(restrictFrom(Roles.DRIVER, Roles.CONTRACTOR), createDailyOrder);

dailyOrderRouter.get("/pptx", restrictFrom(Roles.DRIVER, Roles.CONTRACTOR), createPowerPoint);
dailyOrderRouter.get("/project/:projectId", getDailyOrdersByProject)
dailyOrderRouter.route("/:id").get(getDailyOrder)
    .patch(restrictFrom(Roles.DRIVER, Roles.CONTRACTOR), CheckOrderUpdates, updateDailyOrder)
    .delete(restrictFrom(Roles.DRIVER, Roles.CONTRACTOR), deleteDailyOrder);
dailyOrderRouter.patch(
    "/:id/approval",
    protect,
    restrictTo(Roles.ADMIN, Roles.REGION_MANAGER),
    updateApprovalStatus
);


export default dailyOrderRouter;