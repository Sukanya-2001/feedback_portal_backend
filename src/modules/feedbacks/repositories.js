import Feedback from "./model.js";

class FeedbackRepository {
  async save(data) {
    let savedData = await Feedback.create(data);
    return savedData;
  }

  async findAll(projectId) {
    let findData = await Feedback.find({
      projectId: projectId,
      isDeleted: false,
    });
    return findData;
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
}

export default new FeedbackRepository();
