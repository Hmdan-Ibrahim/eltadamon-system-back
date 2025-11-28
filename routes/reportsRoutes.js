import { Router } from "express";
import { gitReports } from "../controllers/reportController.js";

const reportsRouter = Router();

reportsRouter.route("/")
    .get(gitReports)
// .post(createUserValidator, createUser)
// .post(createDailyOrder);

// dailyOrderRouter.route("/status").get(gitDailyOrderStatus)

// dailyOrderRouter.route("/:id").get(getDailyOrder)
//     // .patch(updateUserValidator, updateUser)
//     .patch(updateDailyOrder)
//     .delete(deleteDailyOrder);

export default reportsRouter;