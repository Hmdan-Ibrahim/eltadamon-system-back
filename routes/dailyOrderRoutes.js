import { Router } from "express";
import { createDailyOrder, deleteDailyOrder, getAllDailyOrders, getDailyOrder, getDailyOrdersByProject, updateDailyOrder } from "../controllers/dailyOrderController.js";
import { protect } from "../middleware/protect.js";

const dailyOrderRouter = Router();

dailyOrderRouter.use(protect)

dailyOrderRouter.route("/")
    .get(getAllDailyOrders)
    // .post(createUserValidator, createUser)
    .post(createDailyOrder);

// dailyOrderRouter.route("/status").get(gitDailyOrderStatus)
dailyOrderRouter.get("/project/:projectId", getDailyOrdersByProject)
dailyOrderRouter.route("/:id").get(getDailyOrder)
    // .patch(updateUserValidator, updateUser)
    .patch(updateDailyOrder)
    .delete(deleteDailyOrder);

export default dailyOrderRouter;