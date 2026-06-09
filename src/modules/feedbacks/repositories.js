import Feedback from "./model.js";

class FeedbackRepository {
  async save(data) {
    let savedData = await Feedback.create(data);
    return savedData;
  }

  async findAll(project_id) {
    let findData = await Feedback.find({
      project_id: project_id,
      isDeleted: false,
    });
    return findData;
  }

  async update(feedback_id, data) {
    let updatedData = await Feedback.findOneAndUpdate(
      { _id: feedback_id, isDeleted: false },
      data,
      { new: true },
    );
    return updatedData;
  }

  async delete(feedback_id) {
    let deletedData = await Feedback.findByIdAndUpdate(feedback_id, {
      isDeleted: true,
    });
    return deletedData;
  }
}

export default new FeedbackRepository();
