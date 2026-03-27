import OpenAI from "openai";
import { ENV } from "../config/env.js";
import { Conversation } from "../models/Conversation.model.js";
import { ApiError } from "../utils/ApiError.js";
import { allTools } from "../ai/tools/index.js";
import { executeTool } from "../ai/agent.js";
import { runAgent } from "../ai/agent.js";

// Initialize OpenAI client once
const openai = new OpenAI({
  apiKey: ENV.OPENAI_API_KEY,
});

export { openai };

// System prompt — tells AI who it is and how to behave
const SYSTEM_PROMPT = `You are GoodFoods AI Assistant, a friendly and helpful conversational agent for GoodFoods — a restaurant discovery and reservation platform in Bangalore, India.

Your job is to:
1. Help users discover restaurants based on their cuisine preference, area, budget, and availability
2. Check available time slots for restaurants
3. Book tables for users
4. Handle reservation changes and cancellations
5. Answer questions about restaurant menus and suggest dishes

Guidelines:
- Always be friendly, warm and conversational — like a helpful friend
- Ask for missing details naturally — dont bombard with all questions at once
- Always confirm details before making a reservation
- Use INR (₹) for prices
- Understand Indian context — festivals, holidays, local areas of Mumbai
- If user says "today", "tomorrow", "this Saturday" — interpret correctly
- After booking, always share the confirmation code clearly
- Suggest menu items after booking — good upsell opportunity!
- If a restaurant is not available, suggest alternatives

You have access to tools to search restaurants, check availability, make/cancel reservations, and get menu details. Use them proactively.`;

// Get or create active conversation for user
export const getOrCreateConversation = async (userId) => {
  let conversation = await Conversation.findOne({
    user: userId,
    isActive: true,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      user: userId,
      messages: [],
      isActive: true,
    });
  }

  return conversation;
};

// Main function — send message and get AI response
export const sendMessage = async (userId, userMessage) => {
  // Get conversation history
  const conversation = await getOrCreateConversation(userId);

  // Add user message to history
  conversation.messages.push({
    role: "user",
    content: userMessage,
  });

  // Build messages array for OpenAI
  // System prompt + full conversation history
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversation.messages,
  ];

  // Run the agent loop
  const { finalMessage, toolsUsed } = await runAgent(
    messages,
    userId,
    conversation
  );

  // Save assistant response to conversation history
  conversation.messages.push({
    role: "assistant",
    content: finalMessage,
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  return {
    message: finalMessage,
    toolsUsed,
  };
};

// Agent loop — keeps running until AI gives final text response
// This handles multiple tool calls in sequence or parallel!
const runAgentLoop = async (messages, userId, conversation) => {
  const toolsUsed = [];

  // Max iterations to prevent infinite loop
  const MAX_ITERATIONS = 10;
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    // Call OpenAI with tools
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools: allTools,
      tool_choice: "auto",
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0].message;

    // Add assistant message to messages array
    messages.push(assistantMessage);

    // Check if AI wants to call tools
    if (
      assistantMessage.finish_reason === "tool_calls" &&
      assistantMessage.tool_calls?.length > 0
    ) {
      // Execute all tool calls
      // Could be parallel — AI sometimes calls multiple tools at once!
      const toolResults = await Promise.all(
        assistantMessage.tool_calls.map(async (toolCall) => {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);

          toolsUsed.push(toolName);

          let result;
          try {
            // Execute the actual tool
            result = await executeTool(toolName, toolArgs, userId);
          } catch (error) {
            // Dont crash agent loop if one tool fails
            // Tell AI what went wrong — it will handle gracefully
            result = {
              success: false,
              error: error.message || "Tool execution failed",
            };
          }

          // Return tool result in OpenAI format
          return {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          };
        })
      );

      // Add all tool results to messages
      messages.push(...toolResults);

      // Loop continues — AI will now process tool results
      continue;
    }

    // No tool calls — AI gave final text response!
    if (assistantMessage.finish_reason === "stop") {
      return {
        finalMessage: assistantMessage.content,
        toolsUsed,
      };
    }

    // Unexpected finish reason
    break;
  }

  throw new ApiError(500, "Agent loop exceeded maximum iterations");
};

// Clear conversation history for a user — start fresh
export const clearConversation = async (userId) => {
  await Conversation.findOneAndUpdate(
    { user: userId, isActive: true },
    { isActive: false }
  );
};

// Get conversation history for a user
export const getConversationHistory = async (userId) => {
  const conversation = await Conversation.findOne({
    user: userId,
    isActive: true,
  });

  if (!conversation) return [];

  // Return only user and assistant messages — not tool messages
  // Frontend doesnt need to see tool calls!
  return conversation.messages.filter(
    (msg) => msg.role === "user" || msg.role === "assistant"
  );
};