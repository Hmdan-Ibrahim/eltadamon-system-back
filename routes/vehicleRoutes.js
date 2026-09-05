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
import { restrictTo } from "../middleware/restrictTo.js";
import { Roles } from "../util/Roles.js";

const vehicleRoutes = Router();
vehicleRoutes.use(protect);
vehicleRoutes.get("/count", getCountVehicleDocs);
vehicleRoutes
    .route("/")
    .get(getAllVehicles)
    .post(restrictTo(Roles.ADMIN), createVehicle);
vehicleRoutes
    .route("/:id")
    .get(getVehicle)
    .patch(restrictTo(Roles.ADMIN), updateVehicle)
    .delete(restrictTo(Roles.ADMIN), deleteVehicle);

export default vehicleRoutes;
