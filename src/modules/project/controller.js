import { projectValidationSchema } from "./project.validation.js";
import projectRepository from "./repositories.js";
import authRepository from "../auth/repositories.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { generateSlug } from "../../utils/slugGenerator.js";

export const createProject = async (req, res) => {
  try {
    if (req.file) {
      req.body.image = req.file.path;
    }
    if (req.body.categories && !Array.isArray(req.body.categories)) {
      req.body.categories = [req.body.categories];
    }

    const validate = projectValidationSchema.safeParse(req.body);
    if (!validate.success) {
      return sendError(
        res,
        "Validation failed.",
        validate.error.flatten().fieldErrors,
        400,
      );
    }
    const validatedData = validate.data;
    const user = await authRepository.getUserById(req.user.id);
    if (!user) {
      return sendError(res, "User not found.", null, 404);
    }
    const slug = generateSlug(validatedData.projectName);
    const newData = {
      projectName: validatedData.projectName,
      description: validatedData.description,
      image: validatedData.image,
      websiteLink: validatedData.websiteLink,
      categories: validatedData.categories,
      userId: user._id,
      userName: user.fullName,
      slug: slug,
    };
    const project = await projectRepository.create(newData);

    if (project && project._id) {
      return sendSuccess(res, "Project created successfully.", project, 201);
    } else {
      return sendError(res, "Internal server error.", null, 500);
    }
  } catch (err) {
    console.error("CreateProject Error:", err);
    return sendError(res, "Internal server error.", null, 500);
  }
};

export const getAllProject = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const userId = req.user.id || null;

    const projects = await projectRepository.getAll(
      page,
      limit,
      userId,
      category,
      search,
    );
    if (!projects) {
      return sendSuccess(res, "No projects found", [], 200);
    } else {
      return sendSuccess(res, "Projects fetched successfully", projects, 200);
    }
  } catch (err) {
    console.error("GetAllProject Error:", err);
    return sendError(res, "Internal server error.", null, 500);
  }
};

export const getAllUsersProject = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const sortBy = req.query.sortBy || "newest";
    const category = req.query.category;
    const search = req.query.search;

    const projects = await projectRepository.getAll(
      page,
      limit,
      undefined,
      category,
      search,
      sortBy,
    );
    if (!projects) {
      return sendSuccess(res, "No projects found", [], 200);
    } else {
      return sendSuccess(res, "Projects fetched successfully", projects, 200);
    }
  } catch (err) {
    console.error("GetAllProject Error:", err);
    return sendError(res, "Internal server error.", null, 500);
  }
};

export const getProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let project = await projectRepository.getBySlug(slug);
    if (project && project._id) {
      return sendSuccess(res, "Project fetched successfully.", project, 200);
    } else {
      return sendError(res, "Project not found.", null, 404);
    }
  } catch (err) {
    console.error("GetProjectById Error:", err);
    return sendError(res, "Internal server error", null, 500);
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    let existingProject = await projectRepository.getById(id);
    if (!existingProject) {
      return sendError(res, "Project not found.", null, 404);
    }

    if (req.file) {
      req.body.image = req.file.path;
    } else if (!req.body.image) {
      req.body.image = existingProject.image;
    }

    if (typeof req.body.categories === "string") {
      try {
        req.body.categories = JSON.parse(req.body.categories);
      } catch (e) {
        req.body.categories = req.body.categories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
      }
    }

    const validate = projectValidationSchema.safeParse(req.body);
    if (!validate.success) {
      return sendError(
        res,
        "Validation failed.",
        validate.error.flatten().fieldErrors,
        400,
      );
    }
    const validatedData = validate.data;
    const project = await projectRepository.update(id, validatedData);

    if (project && project._id) {
      return sendSuccess(res, "Project updated successfully.", project, 200);
    } else {
      return sendError(res, "Internal server error.", null, 500);
    }
  } catch (err) {
    console.error("UpdateProject Error:", err);
    return sendError(res, "Internal server error", null, 500);
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    let deletedData = await projectRepository.deleteById(id);

    if (deletedData && deletedData._id) {
      return sendSuccess(
        res,
        "Project Deleted successfully.",
        deletedData,
        200,
      );
    } else {
      return sendError(res, "Internal server error.", null, 500);
    }
  } catch (err) {
    console.error("DeleteProject Error:", err);
    return sendError(res, "Internal server error.", null, 500);
  }
};
