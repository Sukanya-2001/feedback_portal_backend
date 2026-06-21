import FeedbackRepository from "./repositories.js";
import { feedbackValidation } from "./validation.js";
import { sendSuccess, sendError } from "../../utils/response.js";

class FeedbackController {
  async create(req, res) {
    try {
      console.log(req.body);
      const validate = feedbackValidation.safeParse(req.body);
      console.log(validate);

      if (!validate.success) {
        return sendError(
          res,
          "Validation failed.",
          validate.error.flatten().fieldErrors,
          400,
        );
      } else {
        const savedData = {
          projectId: validate.data.projectId,
          guestName: validate.data.guestName,
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
      const { project_slug: slug } = req.params;
      const saved = req.query.saved;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const isSaved = saved === "true";
      console.log(saved, "SAVED");
      let data = await FeedbackRepository.findAll(page, limit, slug, isSaved);
      if (data && data.feedbacks && data.feedbacks.length > 0) {
        return sendSuccess(res, "Feedback fetched successfully.", data, 200);
      } else {
        return sendSuccess(
          res,
          "Feedback not found.",
          { feedbacks: [], page, limit, total: 0, totalPages: 0 },
          200,
        );
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
      const { feedback_id } = req.params;
      if (!req.body.comment?.trim()) {
        return sendError(res, "Comment is required", null, 400);
      } else {
        const newData = {
          reply: {
            comment: req.body.comment.trim(),
            created_at: new Date(),
          },
        };
        console.log(feedback_id, newData, "HEREE");
        let data = await FeedbackRepository.update(feedback_id, newData);
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

  async saveFeedback(req, res) {
    try {
      const { feedback_id } = req.params;
      let data = await FeedbackRepository.toggleSave(feedback_id);
      if (data && data._id) {
        return sendSuccess(res, "Feedback Status successfully.", data, 200);
      } else {
        return sendError(res, "Internal Server Error", null, 500);
      }
    } catch (err) {
      return sendError(res, "Internal Server Error", null, 500);
    }
  }

  async getSavedFeedbacks(req, res) {
    try {
      let allData = await FeedbackRepository.allSavedFeedback();
      if (allData && allData.length > 0) {
        return sendSuccess(
          res,
          "Feedbacks fetched successfully.",
          allData,
          200,
        );
      } else {
        return sendSuccess(res, "No saved feedbacks found.", [], 200);
      }
    } catch (err) {
      return sendError(res, "Internal Server Error", null, 500);
    }
  }
}

export default new FeedbackController();
