import FeedbackRepository from "./repositories.js";
import { feedbackValidation } from "./validation.js";
import { sendSuccess, sendError } from "../../utils/response.js";

class FeedbackController {
  async create(req, res) {
    try {
      const validate = feedbackValidation.safeParse(req.body);

      if (!validate.success) {
        return sendError(res, "Validation failed.", validate.error.flatten().fieldErrors, 400);
      } else {
        const savedData = {
          projectId: validate.data.projectId,
          userName: validate.data.userName,
          guestEmail: validate.data.guestEmail,
          feedback: validate.data.feedback,
        };
        let data = await FeedbackRepository.save(savedData);
        if (data && data._id) {
          return sendSuccess(res, "Feedback posted successfully.", data, 201);
        } else {
          return sendError(res, "Internal Server Error", null, 500);
        }
      }
    } catch (err) {
      console.error("CreateFeedback Error:", err);
      return sendError(res, "Internal Server Error", null, 500);
    }
  }

  async getAll(req, res) {
    try {
      let { projectId } = req.params;
      let data = await FeedbackRepository.findAll(projectId);
      if (data && data.length > 0) {
        return sendSuccess(res, "Feedback fetched successfully.", data, 200);
      } else {
        return sendSuccess(res, "Feedback not found.", [], 200);
      }
    } catch (err) {
      console.error("GetAllFeedback Error:", err);
      return sendError(res, "Internal Server Error", null, 500);
    }
  }

  async update(req, res) {
    try {
      const { feedbackId } = req.params;
      let data = await FeedbackRepository.update(feedbackId, req.body);
      if (data && data._id) {
        return sendSuccess(res, "Feedback updated successfully", data, 200);
      }
      return sendError(res, "Feedback not found", null, 404);
    } catch (err) {
      console.error("UpdateFeedback Error:", err);
      return sendError(res, "Internal Server Error", null, 500);
    }
  }

  async delete(req, res) {
    try {
      const { feedbackId } = req.params;
      let data = await FeedbackRepository.delete(feedbackId);
      if (!data) {
        return sendError(res, "Feedback not found", null, 404);
      }

      return sendSuccess(res, "Feedback deleted successfully.", data, 200);
    } catch (err) {
      console.error("DeleteFeedback Error:", err);
      return sendError(res, "Internal Server Error", null, 500);
    }
  }

  async postreply(req, res) {
    try {
      const { feedbackId } = req.params;
      if (!req.body.comment?.trim()) {
        return sendError(res, "Comment is required", null, 400);
      } else {
        const newData = {
          reply: {
            comment: req.body.comment.trim(),
            created_at: new Date(),
          },
        };
        let data = await FeedbackRepository.update(feedbackId, newData);
        if (data && data._id) {
          return sendSuccess(res, "Reply posted successfully.", data, 201);
        } else {
          return sendError(res, "Internal Server Error", null, 500);
        }
      }
    } catch (err) {
      console.error("PostReply Error:", err);
      return sendError(res, "Internal Server Error", null, 500);
    }
  }
}

export default new FeedbackController();
