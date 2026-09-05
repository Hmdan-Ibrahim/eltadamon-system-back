import { Router } from "express";
import { gitReports } from "../controllers/reportController.js";
import { protect } from "../middleware/protect.js";

const reportsRouter = Router();

reportsRouter.use(protect);
reportsRouter.route("/")
    .get(gitReports)

export default reportsRouter;