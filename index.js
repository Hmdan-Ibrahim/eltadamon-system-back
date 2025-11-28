import express from "express";
import * as dotenv from "dotenv";
import cors from "cors"
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/connectDB.js";
import { globalHandle } from "./middleware/globalHandle.js";

import userRoutes from "./routes/userRoutes.js";
import regionRoutes from "./routes/regionRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import schoolRoutes from "./routes/schoolRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import wellRoutes from "./routes/wellRoutes.js";
import dailyOrderRoutes from "./routes/dailyOrderRoutes.js";
import reportsRouter from "./routes/reportsRoutes.js";
import neighbordhoodRoutes from "./routes/neighbordhoodRoutes.js";


dotenv.config({ path: "config.env" });
const app = express();

const limiter = rateLimit({
    windowMs: 60 * 30 * 1000,
    max: 550,
    message: "تم تجاوز الحد المسموح من الطلبات.",
    // keyGenerator: (req) => req.ip, // استخدم IP كمفتاح
    handler: (req, res, next) => {
        return next({ statusCode: 429, status: "error", message: "تم تجاوز الحد المسموح من الطلبات." })
        // res.status(429).send('تم تجاوز الحد المسموح من الطلبات.');
    }
});

app.use("/api", limiter);

app.use(express.json());
app.use(cookieParser());
app.use(cors())

// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/users", userRoutes);
app.use("/api/regions", regionRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/neighbordhoods", neighbordhoodRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/wells", wellRoutes);
app.use("/api/daily-orders", dailyOrderRoutes);
app.use("/api/reports", reportsRouter);

connectDB(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})


app.use((req, res, next) => {
    return next({ statusCode: 404, status: "error", message: "هذا المورد غير موجود!" })
})
app.use(globalHandle);















// validate in user model