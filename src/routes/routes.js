import express from "express";
import { signIn, signUp, getProfile } from "../modules/auth/controller.js";
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

//Auth
router.post("/signin", signIn);
router.post("/signup", signUp);
router.get("/profile", authMiddleware, getProfile);

export default router;
