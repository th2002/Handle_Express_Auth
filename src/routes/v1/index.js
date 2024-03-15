import { Router } from "express";
import userRoute from "./userRoute";
import authRoute from "./authRoute";

const router = Router();

// Use the user and auth routes
router.use("/user", userRoute);
router.use("/auth", authRoute);

export default router;

