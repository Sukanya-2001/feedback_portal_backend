import { sendError, sendSuccess } from "../../utils/response.js";
import dashboardRepository from "./repositories.js";

export const getDashboardCount = async (req, res) => {
  try {
    const userId = req.user.id;
    let countData = await dashboardRepository.dashboardCount(userId);
    return sendSuccess(res, "Data retrived successfully.", countData, 200);
  } catch (err) {
    console.error("getDashboardCount Error:", err);
    return sendError(res, "Internal Server Error.", null, 500);
  }
};

export const getDashboardGraph = async (req, res) => {
  try {
    const userId = req.user.id;
    let graphData = await dashboardRepository.projectFeedbackGraph(userId);
    return sendSuccess(res, "Data retrived successfully.", graphData, 200);
  } catch (err) {
    return sendError(res, "Internal Server Error", null, 500);
  }
};

export const getProjectByCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return sendError(res, "User not found", null, 500);
    }
    let retrivedData = await dashboardRepository.projectByCategory(userId);
    return sendSuccess(res, "Data retrived successfully.", retrivedData, 200);
  } catch (err) {
    return sendError(res, "Internal Server Error", null, 500);
  }
};

export const getFeedbackGrowth = async (req, res) => {
  try {
    const userId = req.user.id;
    const range = req.query.range || "monthly";
    if (!userId) {
      return sendError(res, "User not found", null, 500);
    }
    let retrivedData = await dashboardRepository.FeedbacksGrowth(userId, range);
    return sendSuccess(res, "Data retrived successfully.", retrivedData, 200);
  } catch (err) {
    return sendError(req, "Internal server error.", null, 500);
  }
};

export const getProjectGrowth = async (req, res) => {
  try {
    const userId = req.user.id;
    const range = req.query.range || "monthly";
    if (!userId) {
      return sendError(res, "User not found", null, 500);
    }
    let retrivedData = await dashboardRepository.ProjectsGrowth(userId, range);
    return sendSuccess(res, "Data retrived successfully.", retrivedData, 200);
  } catch (err) {
    return sendError(req, "Internal server error.", null, 500);
  }
};

export const getRecentFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    let recentFeedback = await dashboardRepository.recentFeedbacks(userId);
    return sendSuccess(
      res,
      "Feedback fetched successfully.",
      recentFeedback,
      200,
    );
  } catch (err) {
    return sendError(res, "Internal server error.", null, 500);
  }
};
