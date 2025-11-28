import { Router } from "express";
import { createSchool, deleteSchool, getAllSchools, getSchool, updateSchool } from "../controllers/schoolController.js";

const schoolRoutes = Router();

schoolRoutes.route("/")
    .get(getAllSchools)
    // .post(createUserValidator, createUser)
    .post(createSchool)

schoolRoutes.route("/:id").get(getSchool)
    // .patch(updateUserValidator, updateUser)
    .patch(updateSchool)
    .delete(deleteSchool);

export default schoolRoutes;