import express from "express";
import { createUploadUrl, deleteManyImages } from "../controllers/storageController.js";
import { protect } from "../middleware/protect.js";


const storageRoutes = express.Router();

storageRoutes.use(protect);
storageRoutes.post(
    "/upload-url", createUploadUrl
);

storageRoutes.post(
    "/delete-many", deleteManyImages
);

export default storageRoutes;