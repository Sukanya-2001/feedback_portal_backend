import project from "./model.js";

class projectRepository {
  async create(data) {
    let saveData = await project.create(data);
    return saveData;
  }

  async getAll(page = 1, limit = 10, userId) {
    const skip = (page - 1) * limit;
    const filter = {
    isDeleted: false,
  };

  if (userId) {
    filter.userId = userId;
  }
    const [projects, total] = await Promise.all([
      project
        .find(filter)
        .populate("userId", "fullName email")
        .populate("categories", "name")
        .skip(skip)
        .limit(limit),

      project.countDocuments(),
    ]);
    return {
      projects,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id) {
    let getData = await project.findById(id).populate("categories", "name");
    return getData;
  }

  async update(id, data) {
    let updatedData = await project.findByIdAndUpdate(id, data, { new: true });
    return updatedData;
  }

  async deleteById(id) {
    let findData = await project.findByIdAndUpdate(id, { isDeleted: true });
    return findData;
  }
}

export default new projectRepository();
