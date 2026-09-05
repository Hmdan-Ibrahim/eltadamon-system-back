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
userRoutes.patch("/auth/change/userData/:id", restrictTo(Roles.ADMIN), updateUser)
userRoutes.route("/")
    .get(getAllUsers)
    .post(restrictTo(Roles.ADMIN), createUser)

userRoutes.route("/:id").get(getUser)
    .patch(restrictTo(Roles.ADMIN), updateUser)
    .delete(restrictTo(Roles.ADMIN), deleteUser);

export default userRoutes;