import project from "./model.js";
import Feedback from "../feedbacks/model.js";

class projectRepository {
  async create(data) {
    let saveData = await project.create(data);
    return saveData;
  }

  async getAll(page = 1, limit = 10, userId, category, search) {
    const skip = (page - 1) * limit;

    const filter = {
      isDeleted: false,
    };
    if (category) {
      filter.categories = category;
    }

    if (userId) {
      filter.userId = userId;
    }

    if (search?.trim()) {
      filter.$or = [{ projectName: { $regex: search, $options: "i" } }];
    }

    const [projects, total] = await Promise.all([
      project
        .find(filter)
        .sort({createdAt: -1})
        .populate("userId", "fullName email")
        .populate("categories", "name")
        .skip(skip)
        .limit(limit),

      project.countDocuments(filter),
    ]);

    const projectIds = projects.map((p) => p._id);

    const feedbackCounts = await Feedback.aggregate([
      {
        $match: {
          projectId: { $in: projectIds },
        },
      },
      {
        $group: {
          _id: "$projectId",
          count: { $sum: 1 },
        },
      },
    ]);

    const feedbackCountMap = {};

    feedbackCounts.forEach((item) => {
      feedbackCountMap[item._id.toString()] = item.count;
    });

    const projectsWithFeedbackCount = projects.map((p) => ({
      ...p.toObject(),
      feedbackCount: feedbackCountMap[p._id.toString()] || 0,
    }));

    return {
      projects: projectsWithFeedbackCount,
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

  async getBySlug(slug) {
    let getData = await project
      .findOne({ slug })
      .populate("categories", "name");
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
