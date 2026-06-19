import Feedback from "./model.js";
import project from "../project/model.js";

class FeedbackRepository {
  async save(data) {
    let savedData = await Feedback.create(data);
    return savedData;
  }

  async findAll(page = 1, limit = 10, slug) {
    const skip = (page - 1) * limit;
    const filter = {
      isDeleted: false,
    };
    const projectId = await project.findOne({ slug });

    if (projectId) {
      filter.projectId = projectId;
    }
    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Feedback.countDocuments(filter),
    ]);
    return {
      feedbacks,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(feedbackId, data) {
    let updatedData = await Feedback.findOneAndUpdate(
      { _id: feedbackId, isDeleted: false },
      data,
      { new: true },
    );
    return updatedData;
  }

  async delete(feedbackId) {
    let deletedData = await Feedback.findByIdAndUpdate(feedbackId, {
      isDeleted: true,
    });
    return deletedData;
  }

  async toggleSave(feedbackId) {
    let findData = await Feedback.findById(feedbackId);
    let updateData = await Feedback.findByIdAndUpdate(
      feedbackId,
      {
        isSaved: !findData.isSaved,
      },
      { new: true },
    );
    console.log(findData, updateData, "GTGTGG");
    return updateData;
  }
}

export default new FeedbackRepository();
