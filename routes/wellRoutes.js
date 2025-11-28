import { Router } from "express";
import { createWell, deleteWell, getAllWells, getWell, updateWell } from "../controllers/wellController.js";

const wellRoutes = Router();

wellRoutes.route("/")
    .get(getAllWells)
    // .post(createUserValidator, createUser)
    .post(createWell)

wellRoutes.route("/:id").get(getWell)
    // .patch(updateUserValidator, updateUser)
    .patch(updateWell)
    .delete(deleteWell);

export default wellRoutes;