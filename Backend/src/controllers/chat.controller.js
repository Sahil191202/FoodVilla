import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  sendMessage,
  clearConversation,
  getConversationHistory,
} from "../services/openai.service.js";

export const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    throw new ApiError(400, "Message cannot be empty");
  }

  const response = await sendMessage(req.user._id, message.trim());

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Message sent successfully"));
});

export const getChatHistory = asyncHandler(async (req, res) => {
  const history = await getConversationHistory(req.user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count: history.length, messages: history },
        "Chat history fetched successfully"
      )
    );
});

export const clearChat = asyncHandler(async (req, res) => {
  await clearConversation(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Chat cleared successfully"));
});