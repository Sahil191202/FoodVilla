import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  cookieOptions,
} from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const user = await registerUser({ name, email, password, phone });

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUser({
    email,
    password,
  });

  // Set tokens in cookies
  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })
    .json(
      new ApiResponse(200, { user, accessToken }, "Logged in successfully")
    );
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user._id);

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export const refreshToken = asyncHandler(async (req, res) => {
  // Token from cookie or body — mobile apps send in body
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshAccessToken(incomingRefreshToken);

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        200,
        { accessToken },
        "Access token refreshed successfully"
      )
    );
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await changePassword(req.user._id, currentPassword, newPassword);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

export const getMe = asyncHandler(async (req, res) => {
  // req.user is already attached by verifyJWT middleware
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});