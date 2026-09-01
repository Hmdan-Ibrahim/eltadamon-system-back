import express from "express";
import { Server } from "socket.io";
import * as dotenv from "dotenv";
import cors from "cors"
import cookieParser from "cookie-parser";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

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
import storageRoutes from "./routes/storageRoutes.js";


dotenv.config({ path: "config.env" });
const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        "https://altadamon-system.vercel.app",
        "https://altadamon-system-production.vercel.app",
        "http://localhost:34786",
    ],
    credentials: true,
    exposedHeaders: [
        "RateLimit-Limit",
        "RateLimit-Remaining",
        "RateLimit-Reset"
    ]
}))

const limiter = rateLimit({
    windowMs: 60 * 15 * 1000,
    max: 650,
    message: "تم تجاوز الحد المسموح من الطلبات.",
    skip: (req) => req.method === "OPTIONS",
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req?.user?._id || req.ip),
    handler: (req, res, next) => {
        return next({ statusCode: 429, status: "error", message: "تم تجاوز الحد المسموح من الطلبات." })
    }
});

app.use("/api", limiter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.use("/api/users", userRoutes);
app.use("/api/regions", regionRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/neighbordhoods", neighbordhoodRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/wells", wellRoutes);
app.use("/api/daily-orders", dailyOrderRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/reports", reportsRouter);

connectDB(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})


const io = new Server(server, {
    cors: {
        origin: [
            "https://altadamon-system.vercel.app",
            "http://localhost:34786",
        ],
    },
});

app.set("io", io);

io.on("connection", (socket) => {
    console.log("Client Connected");
});


app.use((req, res, next) => {
    return next({ statusCode: 404, status: "error", message: "هذا المورد غير موجود!" })
})
app.use(globalHandle);

