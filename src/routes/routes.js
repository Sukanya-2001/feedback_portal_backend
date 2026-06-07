import express from "express";
import { signIn, signUp, getProfile, verifyEmail, forgotPassword, verifyOtp, resetPassword, changePassword } from "../modules/auth/controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { createProject, getAllProject, getProjectById, updateProject, deleteProject } from "../modules/project/controller.js";

const router = express.Router();

//Auth
router.post("/signin", signIn);
router.post("/signup", signUp);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/verify", verifyEmail);
router.post("/reset", resetPassword);
router.get("/profile", authMiddleware, getProfile);
router.post("/change-password", authMiddleware, changePassword);

//Projects
router.post("/projects/create", authMiddleware, createProject);
router.get("/projects/getall", authMiddleware, getAllProject);
router.get("/projects/:id", authMiddleware, getProjectById);
router.patch("/projects/:id", authMiddleware, updateProject);
router.delete("/projects/:id", authMiddleware, deleteProject);

//Feedback
export default router;
