import Feedback from "./model.js";
import project from "../project/model.js";

class FeedbackRepository {
  async save(data) {
    let savedData = await Feedback.create(data);
    return savedData;
  }

  async findAll(page = 1, limit = 10, slug, isSaved) {
    const skip = (page - 1) * limit;
    const filter = {
      isDeleted: false,
    };
    const projectId = await project.findOne({ slug });

    if (projectId) {
      filter.projectId = projectId;
    }
    if (isSaved) {
      filter.isSaved = isSaved;
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

  async allSavedFeedback() {
    const feedbackData = await Feedback.aggregate([
      {
        $match: {
          isDeleted: false,
          isSaved: true,
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "project",
        },
      },
      {
        $unwind: "$project",
      },
      {
        $group: {
          _id: "$projectId",
          project: {
            $first: {
              _id: "$project._id",
              projectName: "$project.projectName",
              slug: "$project.slug",
            },
          },
          feedbackCount: {
            $sum: 1,
          },
          feedbacks: {
            $push: {
              _id: "$_id",
              guestName: "$guestName",
              guestEmail: "$guestEmail",
              feedback: "$feedback",
              createdAt: "$createdAt",
              reply: "$reply",
            },
          },
        },
      },
      {
        $sort: {
          "project.projectName": 1,
        },
      },
    ]);

    return feedbackData;
  }
}

export default new FeedbackRepository();
