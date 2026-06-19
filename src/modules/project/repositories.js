import project from "./model.js";
import Feedback from "../feedbacks/model.js";

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
