import CategoryRepository from "./repositories.js";
import { sendSuccess, sendError } from "../../utils/response.js";

class CategoryController {
  async create(req, res) {
    try {
      if (!req.body.name) {
        return sendError(res, "Category name is required.", null, 400);
      } else {
        const savedData = {
          name: req.body.name.trim(),
        };
        let data = await CategoryRepository.save(savedData);
        if (data && data._id) {
          return sendSuccess(res, "Category created successfully.", data, 201);
        } else {
          return sendError(res, "Internal Server Error", null, 500);
        }
      }
    } catch (err) {
      console.error("CreateCategory Error:", err);
      return sendError(res, "Internal Server Error", null, 500);
    }
  }

  async getAll(req, res) {
    try {
      let data = await CategoryRepository.findAll();
      if (data && data.length > 0) {
        return sendSuccess(res, "Category fetched successfully.", data, 200);
      } else {
        return sendSuccess(res, "Category not found.", [], 200);
      }
    } catch (err) {
      console.error("GetAllCategory Error:", err);
      return sendError(res, "Internal Server Error", null, 500);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      let data = await CategoryRepository.update(id, req.body);
      if (data && data._id) {
        return sendSuccess(res, "Category updated successfully", data, 200);
      } else {
        return sendError(res, "Internal server error", null, 500);
      }
    } catch (err) {
      console.error("UpdateCategory Error:", err);
      return sendError(res, "Internal Server Error", null, 500);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      let data = await CategoryRepository.delete(id);
      if (!data) {
        return sendError(res, "Category not found", null, 404);
      }

      return sendSuccess(res, "Category deleted successfully.", data, 200);
    } catch (err) {
      console.error("DeleteCategory Error:", err);
      return sendError(res, "Internal Server Error", null, 500);
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      let data = await CategoryRepository.findById(id);
      if (data && data._id) {
        return sendSuccess(res, "Category fetched successfully.", data, 200);
      } else {
        return sendError(res, "Category not found.", null, 404);
      }
    } catch (err) {
      console.error("GetCategoryById Error:", err);
      return sendError(res, "Internal Server Error", null, 500);
    }
  }
}

export default new CategoryController();
