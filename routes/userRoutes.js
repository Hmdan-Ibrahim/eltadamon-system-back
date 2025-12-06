import { Router } from "express";
import { createUser, deleteUser, getAllUsers, getUser, updateUser } from "../controllers/userController.js";
import { login, logout } from "../controllers/authController.js";
import { protect } from "../middleware/protect.js";
import { Roles } from "../util/Roles.js";
import { restrictTo } from "../middleware/restrictTo.js";

const userRoutes = Router();

userRoutes.post("/auth/login", login)
userRoutes.use(protect)
userRoutes.post("/auth/logout", logout)
userRoutes.patch("/auth/change/userData/:id", restrictTo(Roles.MANAGER), updateUser)
userRoutes.route("/")
    .get(getAllUsers)
    // .get(getAllUsers)
    .post(restrictTo(Roles.MANAGER), createUser)

userRoutes.route("/:id").get(getUser)
    // .patch(updateUserValidator, updateUser)
    // .patch(protect, restrictTo(Roles.MANAGER), updateUser)
    .delete(restrictTo(Roles.MANAGER), deleteUser);

export default userRoutes;