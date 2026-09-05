import { Router } from "express";
import { createWell, deleteWell, getAllWells, getWell, updateWell } from "../controllers/wellController.js";
import { restrictTo } from "../middleware/restrictTo.js";
import { Roles } from "../util/Roles.js";
import { protect } from "../middleware/protect.js";

const wellRoutes = Router();

// wellRoutes.use(protect);

wellRoutes.route("/")
    .get(getAllWells)
    .post(createWell)

wellRoutes.route("/:id").get(getWell)
    .patch(restrictTo(Roles.ADMIN), updateWell)
    .delete(restrictTo(Roles.ADMIN), deleteWell);

export default wellRoutes;