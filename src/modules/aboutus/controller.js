import aboutRepository from "./repositories.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export const aboutCreqate = async (req, res) => {
  try {
    if (!req.body.title.trim()) {
      return sendError(res, "Title is required.", null, 400);
    } else if (!req.body.description.trim()) {
      return sendError(res, "Description is required.", null, 400);
    } else {
      const newAbout = {
        title: req.body.title.trim(),
        description: req.body.description.trim(),
      };

      let data = await aboutRepository.create(newAbout);
      if (data || data._id) {
        return sendSuccess(res, "Data saved successfully", data, 200);
      } else {
        return sendError(res, "Internal Server error", null, 500);
      }
    }
  } catch (error) {
    console.error("AboutCreate Error:", error);
    return sendError(res, error.message, null, 500);
  }
};
