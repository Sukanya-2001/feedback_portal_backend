import {
  genarateAccessToken,
  genarateRefreshToken,
} from "../../utils/utils.js";
import bcrypt from "bcryptjs";
import authRepository from "./repositories.js";
import { loginValidationSchema } from "./login.validation.js";
import { signupValidationSchema } from "./signup.validation.js";
import { forgotValidationSchema } from "./forgot.validation.js";
import { resetValidationSchema } from "./reset.validation.js";
import { changePassValidationSchema } from "./changePass.validation.js";
import { redisClient } from "../../../config/redis.js";
import { sendOTPEmail } from "../../utils/mailer.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export const signUp = async (req, res) => {
  try {
    const validate = signupValidationSchema.safeParse(req.body);

    if (!validate.success) {
      return sendError(
        res,
        "Validation failed.",
        validate.error.flatten().fieldErrors,
        400,
      );
    } else {
      const email = req.body.email.trim();
      const userExist = await authRepository.findByFieldName({ email });
      if (userExist) {
        return sendError(
          res,
          "User with this email already exists.",
          null,
          400,
        );
      }
      const hashedPassword = await bcrypt.hash(req.body.password.trim(), 10);
      const saveData = {
        fullName: req.body.fullName.trim(),
        email: email,
        password: hashedPassword,
      };

      let data = await authRepository.userCreate(saveData);

      if (data && data._id) {
        // // Generate a 6-digit OTP
        // const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // // Store OTP in Redis with 5 minutes (300 seconds) expiry
        // await redisClient.set(`otp:verify:${email}`, otp, { EX: 300 });

        // // Send Email
        // await sendOTPEmail(email, otp, "Email Verification Code");

        return sendSuccess(
          res,
          "User signed up successfully. Please verify your email with the OTP sent to your inbox.",
          { userId: data._id },
          201,
        );
      } else {
        return sendError(res, "Internal server error.", null, 500);
      }
    }
  } catch (error) {
    console.error("SignUp Error:", error);
    return sendError(res, "Bad gateway.", null, 502);
  }
};

export const signIn = async (req, res) => {
  try {
    const validate = loginValidationSchema.safeParse(req.body);

    if (!validate.success) {
      return sendError(
        res,
        "Validation failed.",
        validate.error.flatten().fieldErrors,
        400,
      );
    } else {
      const userExist = await authRepository.findByFieldName({
        email: req.body.email.trim(),
      });
      if (!userExist) {
        return sendError(
          res,
          "Email does not exist. Please sign up with this email.",
          null,
          400,
        );
      }

      const matchedPassword = await bcrypt.compare(
        req.body.password.trim(),
        userExist.password,
      );
      if (!matchedPassword) {
        return sendError(res, "Password incorrect.", null, 400);
      }

      // if (!userExist.isVerified) {
      //   return sendError(
      //     res,
      //     "Please verify your email address before logging in.",
      //     null,
      //     403,
      //   );
      // }

      const payload = {
        id: userExist._id,
        email: userExist.email,
      };

      const accessToken = genarateAccessToken(payload);
      const refreshToken = genarateRefreshToken(payload);

      return sendSuccess(res, "User loggedin successfully.", {
        userExist,
        accessToken,
        refreshToken,
      });
    }
  } catch (error) {
    console.error("SignIn Error:", error);
    return sendError(res, "Bad gateway.", null, 502);
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await authRepository.getUserById(req.user.id);
    if (!user) {
      return sendError(res, "User not found", null, 400);
    }
    let userProfile = user.toObject();
    delete userProfile.password;

    return sendSuccess(res, "User profile retrives successfully", 
      userProfile,
    );
  } catch (err) {
    console.error("GetProfile Error:", err);
    return sendError(res, "Internal server error.", null, 502);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const validate = forgotValidationSchema.safeParse(req.body);

    if (!validate.success) {
      return sendError(
        res,
        "Validation failed.",
        validate.error.flatten().fieldErrors,
        400,
      );
    }

    const email = req.body.email.trim();
    const userExist = await authRepository.getUser(email);
    if (!userExist) {
      return sendError(res, "User not found.", null, 400);
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 5 minutes (300 seconds) expiry
    await redisClient.set(`otp:reset:${email}`, otp, { EX: 300 });

    // Send Email
    await sendOTPEmail(email, otp, "Password Reset Code");

    return sendSuccess(
      res,
      "OTP sent to email. Please verify it to reset your password.",
    );
  } catch (err) {
    console.error("ForgotPassword Error:", err);
    return sendError(res, "Internal server error.", null, 500);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return sendError(res, "Email and OTP are required.", null, 400);
    }

    const trimmedEmail = email.trim();
    const storedOtp = await redisClient.get(`otp:verify:${trimmedEmail}`);

    if (!storedOtp || storedOtp !== otp.trim()) {
      return sendError(res, "OTP expired or invalid.", null, 400);
    }

    const userExist = await authRepository.getUser(trimmedEmail);
    if (!userExist) {
      return sendError(res, "User not found.", null, 400);
    }

    // Update isVerified to true
    await authRepository.updateVerificationStatus(userExist._id, true);

    // Delete OTP from Redis
    await redisClient.del(`otp:verify:${trimmedEmail}`);

    return sendSuccess(res, "Email verified successfully. You can now login.");
  } catch (err) {
    console.error("VerifyEmail Error:", err);
    return sendError(res, "Internal server error.", null, 500);
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return sendError(res, "Email and OTP are required.", null, 400);
    }

    const trimmedEmail = email.trim();
    const storedOtp = await redisClient.get(`otp:reset:${trimmedEmail}`);

    if (!storedOtp || storedOtp !== otp.trim()) {
      return sendError(res, "OTP expired or invalid.", null, 400);
    }

    // Store "reset-allowed" flag in Redis (expires in 5 minutes)
    await redisClient.set(`reset-allowed:${trimmedEmail}`, "true", { EX: 300 });

    // Delete OTP from Redis
    await redisClient.del(`otp:reset:${trimmedEmail}`);

    return sendSuccess(
      res,
      "OTP verified successfully. You can now reset your password.",
    );
  } catch (err) {
    console.error("VerifyOtp Error:", err);
    return sendError(res, "Internal server error.", null, 500);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const validate = resetValidationSchema.safeParse(req.body);
    if (!validate.success) {
      return sendError(
        res,
        "Validation failed.",
        validate.error.flatten().fieldErrors,
        400,
      );
    }

    const email = req.body.email.trim();

    // Check if the user is allowed to reset the password
    const isAllowed = await redisClient.get(`reset-allowed:${email}`);
    if (!isAllowed) {
      return sendError(
        res,
        "Reset session expired or invalid. Please verify OTP first.",
        null,
        400,
      );
    }

    const userExist = await authRepository.getUser(email);
    if (!userExist) {
      return sendError(res, "User not found.", null, 400);
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const updateData = {
      password: hashedPassword,
    };

    await authRepository.updateUser(userExist._id, updateData);

    // Delete the reset-allowed flag
    await redisClient.del(`reset-allowed:${email}`);

    return sendSuccess(res, "Password reset successfully.");
  } catch (err) {
    console.error("ResetPassword Error:", err);
    return sendError(res, "Internal server error.", null, 500);
  }
};

export const changePassword = async (req, res) => {
  try {
    const validate = changePassValidationSchema.safeParse(req.body);

    if (!validate.success) {
      return sendError(
        res,
        "Validation failed.",
        validate.error.flatten().fieldErrors,
        400,
      );
    }

    const userDel = await authRepository.getUserById(req.user.id);

    const matchedPass = await bcrypt.compare(
      req.body.old_password,
      userDel.password,
    );
    if (!matchedPass) {
      return sendError(res, "Old password does not matched.", null, 400);
    }

    const newhashedPass = await bcrypt.hash(req.body.new_password, 10);
    const newData = {
      password: newhashedPass,
    };

    await authRepository.updateUser(userDel._id, newData);

    return sendSuccess(res, "Password changed successfully.");
  } catch (err) {
    console.error("ChangePassword Error:", err);
    return sendError(res, "Internal server error.", null, 500);
  }
};
