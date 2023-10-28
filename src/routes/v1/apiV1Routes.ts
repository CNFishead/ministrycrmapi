import express from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import uploadRoutes from "./uploadRoutes";
import ministryRoutes from "./ministryRoutes";
import memberRoutes from "./memberRoutes";
import familyRoutes from "./familyRoutes";
import notificationRoutes from "./notificationRoutes";



const router = express.Router();

// Import all of our routes
router.use("/auth", authRoutes);
router.use("/family", familyRoutes);
router.use("/user", userRoutes);
router.use("/upload", uploadRoutes);
router.use("/ministry", ministryRoutes);
router.use("/member", memberRoutes);
router.use("/notification", notificationRoutes);

export default router;
