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

const schoolRoutes = Router();

schoolRoutes.use(protect);
schoolRoutes
    .route("/")
    .get(getAllSchools)
    .post(createSchool);
schoolRoutes.get("/count", getCountSchoolDocs);
schoolRoutes
    .route("/:id")
    .get(getSchool)
    .patch(updateSchool)
    .delete(deleteSchool);

export default schoolRoutes;
