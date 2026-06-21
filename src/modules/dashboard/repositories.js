import mongoose from "mongoose";
import Project from "../project/model.js";
import Feedback from "../feedbacks/model.js";

class dashboardRepository {
  async dashboardCount(userId) {
    const userProjects = await Project.find(
      { userId, isDeleted: false },
      "_id",
    );
    const projectIds = userProjects.map((p) => p._id);

    const [totalProjects, totalFeedbacks] = await Promise.all([
      Project.countDocuments({ userId, isDeleted: false }),
      Feedback.countDocuments({
        projectId: { $in: projectIds },
        isDeleted: false,
      }),
    ]);

    return { totalProjects, totalFeedbacks };
  }

  async projectFeedbackGraph(userId) {
    const data = await Project.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "feedbacks",
          let: { projectId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$projectId", "$$projectId"] },
                    { $eq: ["$isDeleted", false] },
                  ],
                },
              },
            },
            {
              $count: "count",
            },
          ],
          as: "feedbackStats",
        },
      },
      {
        $project: {
          projectName: 1,
          feedbackCount: {
            $ifNull: [{ $arrayElemAt: ["$feedbackStats.count", 0] }, 0],
          },
        },
      },
      {
        $sort: {
          feedbackCount: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    return data;
  }

  async recentFeedbacks(userId) {
    const data = await Feedback.aggregate([
      {
        $match: {
          isDeleted: false,
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
        $match: {
          "project.userId": new mongoose.Types.ObjectId(userId),
          "project.isDeleted": false,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 1,
          guestName: 1,
          guestEmail: 1,
          feedback: 1,
          createdAt: 1,
          isSaved: 1,
          projectName: "$project.projectName",
        },
      },
    ]);

    return data;
  }
}

export default new dashboardRepository();
