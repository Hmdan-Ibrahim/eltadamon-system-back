import { Router } from "express";
import {
    createProject,
    getAllProjects,
    getProject,
    getCountProjectDocs,
    getProjectSignatures,
    updateProject,
    deleteProject,
} from "../controllers/projectController.js";
import { protect } from "../middleware/protect.js";
import { restrictTo } from "../middleware/restrictTo.js";
import { Roles } from "../util/Roles.js";

const projectRoutes = Router();

projectRoutes.use(protect);
projectRoutes
    .route("/")
    .post(restrictTo(Roles.ADMIN), createProject)
    .get(restrictTo(Roles.ADMIN, Roles.MANAGER, Roles.REGION_MANAGER), getAllProjects);

projectRoutes.get("/count", getCountProjectDocs);
projectRoutes
    .route("/:id")
    .get(getProject)
    .patch(restrictTo(Roles.ADMIN), updateProject)
    .delete(restrictTo(Roles.ADMIN), deleteProject);
projectRoutes.get(
    "/:id/signatures", restrictTo(Roles.REGION_MANAGER, Roles.PROJECT_MANAGER),
    getProjectSignatures
);

export default projectRoutes;
