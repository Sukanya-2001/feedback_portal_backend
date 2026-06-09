import FeedbackRepository from "./repositories.js";
import { feedbackValidation } from "./validation.js";

class FeedbackController {
  async create(req, res) {
    try {
      const validate = feedbackValidation.safeParse(req.body);

      if (!validate.success) {
        return res
          .status(400)
          .json({
            success: false,
            errors: validate.error.flatten().fieldErrors,
          });
      } else {
        const savedData = {
          project_id: validate.data.project_id,
          user_name: validate.data.user_name,
          guest_email: validate.data.guest_email,
          feedback: validate.data.feedback,
        };
        let data = await FeedbackRepository.save(savedData);
        if (data && data._id) {
          return res
            .status(201)
            .json({ message: "Feedback posted successfully.", data });
        } else {
          return res.status(500).json({ message: "Internal Server Error" });
        }
      }
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getAll(req, res) {
    try {
      let { project_id } = req.params;
      let data = await FeedbackRepository.findAll(project_id);
      if (data.length > 0) {
        return res
          .status(200)
          .json({ message: "Feedback fetched successfully.", data });
      } else {
        return res.status(200).json({ message: "Feedback not found.", data });
      }
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async update(req, res) {
    try {
      const { feedback_id } = req.params;
      let data = await FeedbackRepository.update(feedback_id, req.body);
      if (data && data._id) {
        return res
          .status(200)
          .json({ message: "Feedback updated successfully", data });
      }
      return res.status(404).json({
        message: "Feedback not found",
      });
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async delete(req, res) {
    try {
      const { feedback_id } = req.params;
      let data = await FeedbackRepository.delete(feedback_id);
      if (!data) {
        return res.status(404).json({
          message: "Feedback not found",
        });
      }

      return res
        .status(200)
        .json({ message: "Feedback deleted successfully." });
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async postreply(req, res) {
    try {
      const { feedback_id } = req.params;
      if (!req.body.comment?.trim()) {
        return res.status(400).json({ message: "Comment is required" });
      } else {
        const newData = {
          reply: {
            comment: req.body.comment.trim(),
            created_at: new Date(),
          },
        };
        let data = await FeedbackRepository.update(feedback_id, newData);
        if (data && data._id) {
          return res
            .status(201)
            .json({ message: "Reply posted successfully.", data });
        } else {
          return res.status(500).json({ message: "Internal Server Error" });
        }
      }
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new FeedbackController();
