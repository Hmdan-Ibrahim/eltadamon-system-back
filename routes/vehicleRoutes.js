import { Router } from "express";
import { protect } from '../middleware/protect.js';
import {
    createVehicle,
    deleteVehicle,
    getAllVehicles,
    getVehicle,
    getCountVehicleDocs,
    updateVehicle,
} from "../controllers/vehicleController.js";

const vehicleRoutes = Router();
vehicleRoutes.use(protect);
vehicleRoutes
    .route("/")
    .get(getAllVehicles)
    .post(createVehicle);
vehicleRoutes.get("/count", getCountVehicleDocs);
vehicleRoutes
    .route("/:id")
    .get(getVehicle)
    .patch(updateVehicle)
    .delete(deleteVehicle);

export default vehicleRoutes;
