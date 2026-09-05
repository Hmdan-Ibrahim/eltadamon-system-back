import { Router } from "express";
import { protect } from '../middleware/protect.js';
import {
    createSchool,
    deleteSchool,
    getAllSchools,
    getSchool,
    getCountSchoolDocs,
    updateSchool,
} from "../controllers/schoolController.js";
import { Roles } from "../util/Roles.js";
import { restrictTo } from "../middleware/restrictTo.js";

const schoolRoutes = Router();

schoolRoutes.use(protect);
schoolRoutes.get("/count", getCountSchoolDocs);
schoolRoutes
    .route("/")
    .get(getAllSchools)
    .post(restrictTo(Roles.ADMIN, Roles.PROJECT_MANAGER), createSchool);
schoolRoutes
    .route("/:id")
    .get(getSchool)
    .patch(restrictTo(Roles.ADMIN, Roles.PROJECT_MANAGER), updateSchool)
    .delete(restrictTo(Roles.ADMIN, Roles.PROJECT_MANAGER), deleteSchool);

export default schoolRoutes;
