import mongoose from "mongoose";
import Project from "../project/model.js";
import Feedback from "../feedbacks/model.js";
import Category from "../categories/model.js";

class dashboardRepository {
  async dashboardCount(userId) {
    const userProjects = await Project.find(
      { userId, isDeleted: false },
      "_id",
    );
    const projectIds = userProjects.map((p) => p._id);

    const [totalProjects, totalFeedbacks, savedFeedbacks] = await Promise.all([
      Project.countDocuments({ userId, isDeleted: false }),
      Feedback.countDocuments({
        projectId: { $in: projectIds },
        isDeleted: false,
      }),
      Feedback.countDocuments({
        projectId: { $in: projectIds },
        isDeleted: false,
        isSaved: true,
      }),
    ]);

    return { totalProjects, totalFeedbacks, savedFeedbacks };
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

  async projectByCategory(userId) {
    const data = await Category.aggregate([
      {
        $lookup: {
          from: "projects",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$$categoryId", "$categories"],
                    },
                    {
                      $eq: ["$userId", new mongoose.Types.ObjectId(userId)],
                    },
                    {
                      $eq: ["$isDeleted", false],
                    },
                  ],
                },
              },
            },
          ],
          as: "projects",
        },
      },
      {
        $project: {
          name: 1,
          projectCount: {
            $size: "$projects",
          },
        },
      },
      {
        $match: {
          projectCount: { $gt: 0 },
        },
      },
    ]);

    return data;
  }

  async FeedbacksGrowth(userId, range) {
    const now = new Date();
    let result;
    if (range === "monthly") {
      const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

      const data = await Feedback.aggregate([
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
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

      const months = [];

      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

        months.push({
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          label: date.toLocaleString("default", {
            month: "short",
          }),
        });
      }

      result = months.map((m) => {
        const found = data.find(
          (d) => d._id.year === m.year && d._id.month === m.month,
        );

        return {
          label: m.label,
          count: found?.count || 0,
        };
      });
    } else {
      const currentYear = new Date().getFullYear();

      const startDate = new Date(currentYear - 4, 0, 1);

      const data = await Feedback.aggregate([
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
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]);

      const years = [];

      for (let year = currentYear - 4; year <= currentYear; year++) {
        years.push(year);
      }

      result = years.map((year) => {
        const found = data.find((d) => d._id.year === year);

        return {
          label: String(year),
          count: found?.count || 0,
        };
      });
    }

    return result;
  }

  async ProjectsGrowth(userId, range) {
    const now = new Date();
    let result;
    if (range === "monthly") {
      const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

      const data = await Project.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

      const months = [];

      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

        months.push({
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          label: date.toLocaleString("default", {
            month: "short",
          }),
        });
      }

      result = months.map((m) => {
        const found = data.find(
          (d) => d._id.year === m.year && d._id.month === m.month,
        );

        return {
          label: m.label,
          count: found?.count || 0,
        };
      });
    } else {
      const currentYear = new Date().getFullYear();

      const startDate = new Date(currentYear - 4, 0, 1);

      const data = await Project.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]);

      const years = [];

      for (let year = currentYear - 4; year <= currentYear; year++) {
        years.push(year);
      }

      result = years.map((year) => {
        const found = data.find((d) => d._id.year === year);

        return {
          label: String(year),
          count: found?.count || 0,
        };
      });
    }

    return result;
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
