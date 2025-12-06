import { Router } from "express";
import {
    createProject,
    deleteProject,
    getAllProjects,
    getProject,
    getCountProjectDocs,
    updateProject,
} from "../controllers/projectController.js";
import { protect } from "../middleware/protect.js";
import { restrictTo } from "../middleware/restrictTo.js";
import { Roles } from "../util/Roles.js";

const projectRoutes = Router();

projectRoutes.use(protect);
projectRoutes
    .route("/")
    .post(restrictTo(Roles.MANAGER, Roles.REGION_MANAGER), createProject)
    .get(getAllProjects);

projectRoutes.get("/count", getCountProjectDocs);
projectRoutes
    .route("/:id")
    .get(getProject)
    .patch(restrictTo(Roles.MANAGER, Roles.REGION_MANAGER), updateProject)
    .delete(restrictTo(Roles.MANAGER, Roles.REGION_MANAGER), deleteProject);

export default projectRoutes;
