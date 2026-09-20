import { Router } from "express";
import { protect } from "../middleware/protect.js";
import { createSchoolQuota } from "../controllers/schoolQuotaController.js";
import { restrictTo } from "../middleware/restrictTo.js";
import { Roles } from "../util/Roles.js";

const schoolQuotaRouter = Router();

schoolQuotaRouter.use(protect);
schoolQuotaRouter.route("/")
    .post(restrictTo(Roles.ADMIN), createSchoolQuota)

export default schoolQuotaRouter;
