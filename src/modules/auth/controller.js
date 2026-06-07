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

export const signUp = async (req, res) => {
  try {
    const validate = signupValidationSchema.safeParse(req.body);

    if (!validate.success) {
      return res.status(400).json({
        success: false,
        errors: validate.error.flatten().fieldErrors,
      });
    } else {
      const email = req.body.email.trim();
      const userExist = await authRepository.findByFieldName({ email });
      if (userExist) {
        return res
          .status(400)
          .json({ message: "User with this email already exists." });
      }
      const hashedPassword = await bcrypt.hash(req.body.password.trim(), 10);
      const saveData = {
        fullname: req.body.fullname.trim(),
        email: email,
        password: hashedPassword,
      };

      let data = await authRepository.userCreate(saveData);

      if (data && data._id) {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in Redis with 5 minutes (300 seconds) expiry
        await redisClient.set(`otp:verify:${email}`, otp, { EX: 300 });

        // Send Email
        await sendOTPEmail(email, otp, "Email Verification Code");

        return res
          .status(201)
          .json({ message: "User signed up successfully. Please verify your email with the OTP sent to your inbox.", userId: data._id });
      } else {
        return res.status(500).json({ message: "Internal server error." });
      }
    }
  } catch (error) {
    console.error("SignUp Error:", error);
    return res.status(502).json({ message: "Bad gateway." });
  }
};

export const signIn = async (req, res) => {
  try {
    const validate = loginValidationSchema.safeParse(req.body);

    if (!validate.success) {
      return res.status(400).json({
        success: false,
        errors: validate.error.flatten().fieldErrors,
      });
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

      if (!userExist.isVerified) {
        return res.status(403).json({ message: "Please verify your email address before logging in." });
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

export const forgotPassword = async (req, res) => {
  try {
    const validate = forgotValidationSchema.safeParse(req.body);

    if (!validate.success) {
      return res.status(400).json({
        success: false,
        errors: validate.error.flatten().fieldErrors,
      });
    }

    const email = req.body.email.trim();
    const userExist = await authRepository.getUser(email);
    if (!userExist) {
      return res.status(400).json({ message: "User not found." });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 5 minutes (300 seconds) expiry
    await redisClient.set(`otp:reset:${email}`, otp, { EX: 300 });

    // Send Email
    await sendOTPEmail(email, otp, "Password Reset Code");

    return res.status(200).json({ message: "OTP sent to email. Please verify it to reset your password." });
  } catch (err) {
    console.error("ForgotPassword Error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const trimmedEmail = email.trim();
    const storedOtp = await redisClient.get(`otp:verify:${trimmedEmail}`);

    if (!storedOtp || storedOtp !== otp.trim()) {
      return res.status(400).json({ message: "OTP expired or invalid." });
    }

    const userExist = await authRepository.getUser(trimmedEmail);
    if (!userExist) {
      return res.status(400).json({ message: "User not found." });
    }

    // Update isVerified to true
    await authRepository.updateVerificationStatus(userExist._id, true);

    // Delete OTP from Redis
    await redisClient.del(`otp:verify:${trimmedEmail}`);

    return res.status(200).json({ message: "Email verified successfully. You can now login." });
  } catch (err) {
    console.error("VerifyEmail Error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const trimmedEmail = email.trim();
    const storedOtp = await redisClient.get(`otp:reset:${trimmedEmail}`);

    if (!storedOtp || storedOtp !== otp.trim()) {
      return res.status(400).json({ message: "OTP expired or invalid." });
    }

    // Store "reset-allowed" flag in Redis (expires in 5 minutes)
    await redisClient.set(`reset-allowed:${trimmedEmail}`, "true", { EX: 300 });

    // Delete OTP from Redis
    await redisClient.del(`otp:reset:${trimmedEmail}`);

    return res.status(200).json({ message: "OTP verified successfully. You can now reset your password." });
  } catch (err) {
    console.error("VerifyOtp Error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const validate = resetValidationSchema.safeParse(req.body);
    if (!validate.success) {
      return res.status(400).json({
        success: false,
        errors: validate.error.flatten().fieldErrors,
      });
    }

    const email = req.body.email.trim();
    
    // Check if the user is allowed to reset the password
    const isAllowed = await redisClient.get(`reset-allowed:${email}`);
    if (!isAllowed) {
      return res.status(400).json({ message: "Reset session expired or invalid. Please verify OTP first." });
    }

    const userExist = await authRepository.getUser(email);
    if (!userExist) {
      return res.status(400).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const updateData = {
      password: hashedPassword,
    };

    await authRepository.updateUser(userExist._id, updateData);

    // Delete the reset-allowed flag
    await redisClient.del(`reset-allowed:${email}`);

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("ResetPassword Error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const changePassword = async (req, res) => {
  try {
    const validate = changePassValidationSchema.safeParse(req.body);

    if (!validate.success) {
      return res.status(400).json({
        success: false,
        errors: validate.error.flatten().fieldErrors,
      });
    }

    const userDel = await authRepository.getUserById(req.user.id);

    const matchedPass = await bcrypt.compare(
      req.body.old_password,
      userDel.password,
    );
    if (!matchedPass) {
      return res
        .status(400)
        .json({ message: "Old password does not matched." });
    }

    const newhashedPass = await bcrypt.hash(req.body.new_password, 10);
    const newData = {
      password: newhashedPass,
    };

    await authRepository.updateUser(userDel._id, newData);

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("ChangePassword Error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};
