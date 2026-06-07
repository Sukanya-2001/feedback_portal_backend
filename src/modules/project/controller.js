import { projectValidationSchema } from "./project.validation.js";
import projectRepository from "./repositories.js";
import authRepository from "../auth/repositories.js";

export const createProject = async (req, res) => {
  try {
    const validate = projectValidationSchema.safeParse(req.body);
    if (!validate.success) {
      return res.status(400).json({
        success: false,
        errors: validate.error.flatten().fieldErrors,
      });
    }
    const validatedData = validate.data;
    const user = await authRepository.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newData = {
      project_name: validatedData.project_name,
      description: validatedData.description,
      image: validatedData.image,
      website_link: validatedData.website_link,
      categories: validatedData.categories,
      userId: user._id,
      user_name: user.fullname,
    };
    const project = await projectRepository.create(newData);

    if (project && project._id) {
      return res.status(201).json({ message: "Project created successfully." });
    } else {
      return res.status(500).json({ message: "Internal server error." });
    }
  } catch (err) {
    console.error("CreateProject Error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllProject = async (req, res) => {
  try {
    const projects = await projectRepository.getAll();
    if (!projects) {
      return res.status(200).json({ message: "No projects found" });
    } else {
      return res
        .status(200)
        .json({ message: "Projects fetched successfully", data: projects });
    }
  } catch (err) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    let project = await projectRepository.getById(id);
    if (project && project._id) {
      return res
        .status(200)
        .json({ message: "Project fetched successfully.", data: project });
    } else {
      return res.status(200).json({ message: "Project not found." });
    }
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const validate = projectValidationSchema.safeParse(req.body);
    if (!validate.success) {
      return res.status(400).json({
        success: false,
        errors: validate.error.flatten().fieldErrors,
      });
    }
    const validatedData = validate.data;
    const { id } = req.params;
    const project = await projectRepository.update(id, validatedData);

    if (project && project._id) {
      return res.status(200).json({ message: "Project updated successfully." });
    } else {
      return res.status(500).json({ message: "Internal server error." });
    }
  } catch (err) {
    console.error("UpdateProject Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    let deletedData = await projectRepository.deleteById(id);

    if (deletedData && deletedData._id) {
      return res.status(200).json({ message: "Project Deleted successfully." });
    } else {
      return res.status(500).json({ message: "Internal server error." });
    }
  } catch (err) {
    return res.status(500).json({ message: "Internal server error." });
  }
};
