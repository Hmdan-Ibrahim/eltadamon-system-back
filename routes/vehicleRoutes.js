import { Router } from "express";
import { createVehicle, deleteVehicle, getAllVehicles, getVehicle, updateVehicle } from "../controllers/vehicleController.js";

const vehicleRoutes = Router();

vehicleRoutes.route("/")
    .get(getAllVehicles)
    // .post(createUserValidator, createUser)
    .post(createVehicle);

vehicleRoutes.route("/:id").get(getVehicle)
    // .patch(updateUserValidator, updateUser)
    .patch(updateVehicle)
    .delete(deleteVehicle);

export default vehicleRoutes;