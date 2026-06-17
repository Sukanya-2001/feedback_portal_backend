import express from "express";
import {
  signIn,
  signUp,
  getProfile,
  verifyEmail,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
} from "../modules/auth/controller.js";
import { authMiddleware } from "../middleware/auth.js";
import {
  createProject,
  getAllProject,
  getProjectById,
  updateProject,
  deleteProject,
  getAllUsersProject,
} from "../modules/project/controller.js";
import CategoryController from "../modules/categories/controller.js";
import FeedbackController from "../modules/feedbacks/controller.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

//Auth
router.post("/auth/signin", signIn);
router.post("/auth/signup", signUp);
router.post("/auth/verify-email", verifyEmail);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/verify-otp", verifyOtp);
router.post("/auth/reset-password", resetPassword);
// router.post("/auth/verify", verifyEmail);
// router.post("/reset", resetPassword);
router.get("/profile", authMiddleware, getProfile);
router.post("/change-password", authMiddleware, changePassword);

//Projects
router.post(
  "/projects/create",
  authMiddleware,
  upload.single("image"),
  createProject,
);
router.get("/projects/getall", authMiddleware, getAllProject);
router.get("/projects/:id", authMiddleware, getProjectById);
router.patch("/projects/:id", authMiddleware, upload.single("image"), updateProject);
router.delete("/projects/:id", authMiddleware, deleteProject);
router.get("/allProjects", getAllUsersProject);


//Category
router.post("/categories/create", CategoryController.create);
router.get("/categories/get", CategoryController.getAll);
router.patch("/categories/:id", CategoryController.update);
router.delete("/categories/:id", CategoryController.delete);
router.get("/categories/:id", CategoryController.getById);

//Feedback
router.post("/feedbacks/create", FeedbackController.create);
router.get("/feedbacks/getall/:project_id", FeedbackController.getAll);
router.patch("/feedbacks/update/:feedback_id", FeedbackController.update);
router.delete("/feedbacks/:feedback_id", FeedbackController.delete);
router.patch(
  "/feedbacks/reply/update/:feedback_id",
  authMiddleware,
  FeedbackController.postreply,
);

export default router;
