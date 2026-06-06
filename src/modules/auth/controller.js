import {
  genarateAccessToken,
  genarateRefreshToken,
} from "../../utils/utils.js";
import bcrypt from "bcryptjs";
import authRepository from "./repositories.js";

export const signUp = async (req, res) => {
  try {
    if (
      !req.body.fullname.trim() ||
      !req.body.email.trim() ||
      !req.body.password.trim()
    ) {
      return res.status(400).json({ message: "All fields are required." });
    } else {
      const userExist = await authRepository.findByFieldName({
        email: req.body.email.trim(),
      });
      if (userExist) {
        return res
          .status(400)
          .json({ message: "User with this email already exists." });
      }
      const hashedPassword = await bcrypt.hash(req.body.password.trim(), 10);
      const saveData = {
        fullname: req.body.fullname.trim(),
        email: req.body.email.trim(),
        password: hashedPassword,
      };

      let data = await authRepository.userCreate(saveData);

      if (data && data._id) {
        return res
          .status(201)
          .json({ message: "User sign up successfully.", data });
      } else {
        return res.status(500).json({ message: "Internal server error." });
      }
    }
  } catch {
    return res.status(502).json({ message: "Bad gateway." });
  }
};

export const signIn = async (req, res) => {
  try {
    if (!req.body.email.trim() || !req.body.password.trim()) {
      return res.status(400).json({ message: "All fields are required." });
    } else {
      const userExist = await authRepository.findByFieldName({
        email: req.body.email.trim(),
      });
      if (!userExist) {
        return res.status(400).json({
          message: "Email does not exist. Please sign up with this email.",
        });
      }

      const matchedPassword = await bcrypt.compare(
        req.body.password.trim(),
        userExist.password,
      );
      if (!matchedPassword) {
        return res.status(400).json({ message: "Password incorrect." });
      }

      const payload = {
        id: userExist._id,
        email: userExist.email,
      };

      const accessToken = genarateAccessToken(payload);
      const refreshtoken = genarateRefreshToken(payload);

      return res.status(200).json({
        message: "User loggedin successfully.",
        userExist,
        accessToken,
        refreshtoken,
      });
    }
  } catch {
    return res.status(502).json({ message: "Bad gateway." });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await authRepository.getUserById(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    let userProfile = user.toObject();
    delete userProfile.password;

    return res
      .status(200)
      .json({ message: "User profile retrives successfully", userProfile });
  } catch (err) {
    return res.status(502).json({ message: "Internal server error." });
  }
};
