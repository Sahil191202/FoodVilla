import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ENV } from "../config/env.js";

// Generate access + refresh tokens for a user
export const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { _id: userId, role },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { _id: userId },
    ENV.JWT_SECRET,
    { expiresIn: "30d" }
  );

  return { accessToken, refreshToken };
};

// Cookie options — same for access and refresh
export const cookieOptions = {
  httpOnly: true,   // JS cant access — prevents XSS
  secure: ENV.NODE_ENV === "production",  // HTTPS only in prod
  sameSite: "strict",
};

export const registerUser = async ({ name, email, password, phone }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Create user — password hashing happens in model pre-save hook
  const user = await User.create({ name, email, password, phone });

  // Return user without sensitive fields
  return await User.findById(user._id).select("-password -refreshToken");
};

export const loginUser = async ({ email, password }) => {
  // Find user with password (select: false in model so need explicit +password)
  const user = await User.findOne({ email }).select("+password +refreshToken");

  if (!user) {
    // Dont say "user not found" — security risk!
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  // Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return { user: loggedInUser, accessToken, refreshToken };
};

export const logoutUser = async (userId) => {
  // Remove refresh token from DB
  await User.findByIdAndUpdate(
    userId,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
};

export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, ENV.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id).select("+refreshToken");

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token mismatch");
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user._id,
    user.role
  );

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken: newRefreshToken };
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");

  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();
};