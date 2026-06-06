import express from "express";
import { signIn, signUp, getProfile } from "../modules/auth/controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

//Auth
router.post("/signin", signIn);
router.post("/signup", signUp);
router.get("/profile", authMiddleware, getProfile);

//Projects
router.post("/projects/create", authMiddleware, createProject);
router.get("/projects/getall", authMiddleware, getAllProject);
router.get("/projects/:id", authMiddleware, getProjectById);
router.patch("/projects/:id", authMiddleware, updateProject);
router.delete("/projects/:id", authMiddleware, deleteProject);

export default router;
