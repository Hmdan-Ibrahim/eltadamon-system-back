import { Router } from "express";
import { createWell, deleteWell, getAllWells, getWell, updateWell } from "../controllers/wellController.js";
import { restrictTo } from "../middleware/restrictTo.js";
import { Roles } from "../util/Roles.js";

const wellRoutes = Router();

wellRoutes.route("/")
    .get(getAllWells)
    .post(restrictTo(Roles.ADMIN), createWell)

wellRoutes.route("/:id").get(getWell)
    .patch(restrictTo(Roles.ADMIN), updateWell)
    .delete(restrictTo(Roles.ADMIN), deleteWell);

export default wellRoutes;