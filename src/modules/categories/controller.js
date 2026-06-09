import CategoryRepository from "./repositories.js";

class CategoryController {
  async create(req, res) {
    try {
      if (!req.body.name) {
        return res.status(400).json({ message: "Category name is required." });
      } else {
        const savedData = {
          name: req.body.name.trim(),
        };
        let data = await CategoryRepository.save(savedData);
        if (data && data._id) {
          return res
            .status(201)
            .json({ message: "Category created successfully.", data });
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
      let data = await CategoryRepository.findAll();
      if (data.length > 0) {
        return res
          .status(200)
          .json({ message: "Category fetched successfully.", data });
      } else {
        return res.status(200).json({ message: "Category not found.", data });
      }
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      let data = await CategoryRepository.update(id, req.body);
      if (data && data._id) {
        return res
          .status(200)
          .json({ message: "Category updated successfully", data });
      } else {
        return res.status(500).json({ message: "Internal server error" });
      }
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      let data = await CategoryRepository.delete(id);
      if (!data) {
        return res.status(404).json({
          message: "Category not found",
        });
      }

      return res
        .status(200)
        .json({ message: "Category deleted successfully." });
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      let data = await CategoryRepository.findById(id);
      if (data && data._id) {
        res
          .status(200)
          .json({ message: "Category fetched successfully.", data });
      } else {
        res.status(200).json({ message: "Category not found.", data });
      }
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new CategoryController();
