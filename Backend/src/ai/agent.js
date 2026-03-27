import { executeSearchRestaurants } from "./tools/searchRestaurants.tool.js";
import { executeCheckAvailability } from "./tools/checkAvailability.tool.js";
import { executeMakeReservation } from "./tools/makeReservation.tool.js";
import { executeCancelReservation } from "./tools/cancelReservation.tool.js";
import { executeGetMenu } from "./tools/getMenu.tool.js";
import { executeGetUserReservations } from "./tools/getUserReservations.tool.js";
import { openai } from "../config/openai.js";
import { allTools } from "./tools/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ENV } from "../config/env.js";

// Map tool names → executor functions
const toolExecutors = {
  searchRestaurants: executeSearchRestaurants,
  checkAvailability: executeCheckAvailability,
  makeReservation: executeMakeReservation,
  cancelReservation: executeCancelReservation,
  getMenu: executeGetMenu,
  getUserReservations: executeGetUserReservations,
};

// System prompt — who is the AI, how should it behave
const SYSTEM_PROMPT = `You are FoodVilla AI Assistant — a friendly, 
helpful conversational agent for FoodVilla, a restaurant discovery 
and reservation platform in Mumbai, India.

Your responsibilities:
1. Help users discover restaurants by cuisine, area, budget, availability
2. Check available time slots for specific restaurants
3. Book tables after confirming ALL details with user
4. Handle reservation cancellations
5. Answer menu questions and suggest dishes (upsell opportunity!)
6. Show users their existing reservations

Behavior guidelines:
- Be warm, friendly and conversational — like a helpful local friend
- Always confirm reservation details before actually booking
- Understand Indian context — Mumbai areas, INR prices, festivals
- Interpret dates naturally — "today", "tomorrow", "this Saturday"
- After booking → always suggest checking the menu
- If requested slot unavailable → proactively suggest alternatives
- Never make up restaurant or menu data — always use tools
- If user seems confused → guide them step by step
- Keep responses concise — dont overwhelm with too much text at once

Important rules:
- NEVER book without explicit user confirmation
- NEVER cancel without explicit user confirmation
- Always show confirmation code clearly after booking
- Use INR (₹) for all prices`;

// -------------------------------------------------------
// Main agent runner — called from openai.service.js
// Takes full messages array + userId
// Returns final text response + list of tools used
// -------------------------------------------------------
export const runAgent = async (messages, userId) => {
  // Prepend system prompt
  const fullMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ];

  const MAX_ITERATIONS = 10;
  let iterations = 0;
  const toolsUsed = [];

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    // Log iteration in development
    if (ENV.NODE_ENV === "development") {
      console.log(`\n--- Agent iteration ${iterations} ---`);
    }

    // Call OpenAI
    let response;
    try {
      response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: fullMessages,
        tools: allTools,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 1024,
      });
    } catch (error) {
      // Handle OpenAI API errors specifically
      if (error?.status === 429) {
        throw new ApiError(429, "AI service is busy. Please try again in a moment.");
      }
      if (error?.status === 503) {
        throw new ApiError(503, "AI service is temporarily unavailable.");
      }
      throw new ApiError(500, "Failed to get response from AI service.");
    }

    const assistantMessage = response.choices[0].message;
    const finishReason = response.choices[0].finish_reason;

    if (ENV.NODE_ENV === "development") {
      console.log("Finish reason:", finishReason);
    }

    // Always add assistant message to history
    fullMessages.push(assistantMessage);

    // -------------------------------------------------------
    // Case 1 — AI wants to call tools
    // -------------------------------------------------------
    if (finishReason === "tool_calls" && assistantMessage.tool_calls?.length > 0) {

      if (ENV.NODE_ENV === "development") {
        console.log(
          "Tools requested:",
          assistantMessage.tool_calls.map((t) => t.function.name)
        );
      }

      // Execute all tool calls
      // Could be parallel — AI sometimes calls multiple tools at once!
      // e.g. search restaurants AND check availability simultaneously
      const toolResultMessages = await Promise.all(
        assistantMessage.tool_calls.map(async (toolCall) => {
          const toolName = toolCall.function.name;

          // Parse args safely
          let toolArgs;
          try {
            toolArgs = JSON.parse(toolCall.function.arguments);
          } catch {
            // If args are malformed, tell AI
            return {
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                success: false,
                error: "Failed to parse tool arguments",
              }),
            };
          }

          toolsUsed.push(toolName);

          if (ENV.NODE_ENV === "development") {
            console.log(`Executing: ${toolName}`, toolArgs);
          }

          // Execute tool
          let result;
          try {
            const executor = toolExecutors[toolName];

            if (!executor) {
              result = {
                success: false,
                error: `Unknown tool: ${toolName}`,
              };
            } else {
              // Pass userId for user specific tools
              result = await executor(toolArgs, userId);
            }
          } catch (error) {
            // Tool failed — dont crash loop!
            // Tell AI what went wrong so it can respond gracefully
            if (ENV.NODE_ENV === "development") {
              console.error(`Tool ${toolName} failed:`, error.message);
            }

            result = {
              success: false,
              error: error.message || "Tool execution failed",
              // Give AI hint on what to tell user
              suggestion: "Please inform the user and suggest alternatives",
            };
          }

          if (ENV.NODE_ENV === "development") {
            console.log(`Result from ${toolName}:`, JSON.stringify(result, null, 2));
          }

          // Return in OpenAI tool result format
          return {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          };
        })
      );

      // Add all tool results to messages
      // AI will read these and decide next step
      fullMessages.push(...toolResultMessages);

      // Loop continues — AI processes results
      continue;
    }

    // -------------------------------------------------------
    // Case 2 — AI gave final text response
    // -------------------------------------------------------
    if (finishReason === "stop") {
      if (ENV.NODE_ENV === "development") {
        console.log("\nFinal response:", assistantMessage.content);
        console.log("Tools used:", toolsUsed);
      }

      return {
        finalMessage: assistantMessage.content,
        toolsUsed,
        iterations,
      };
    }

    // -------------------------------------------------------
    // Case 3 — Hit token limit mid response
    // -------------------------------------------------------
    if (finishReason === "length") {
      // Return what we have with a note
      return {
        finalMessage:
          assistantMessage.content +
          "\n\n_(Response was cut short. Please ask me to continue!)_",
        toolsUsed,
        iterations,
      };
    }

    // -------------------------------------------------------
    // Case 4 — Content filtered by OpenAI
    // -------------------------------------------------------
    if (finishReason === "content_filter") {
      throw new ApiError(
        400,
        "Your message could not be processed. Please rephrase and try again."
      );
    }

    // Unknown finish reason — break to avoid infinite loop
    if (ENV.NODE_ENV === "development") {
      console.warn("Unknown finish reason:", finishReason);
    }
    break;
  }

  // Reached max iterations without a final response
  throw new ApiError(
    500,
    "Could not complete your request. Please try again."
  );
};

// -------------------------------------------------------
// Direct tool executor — used for testing tools individually
// Also used in openai.service.js for isolated tool calls
// -------------------------------------------------------
export const executeTool = async (toolName, args, userId) => {
  const executor = toolExecutors[toolName];

  if (!executor) {
    throw new ApiError(400, `Unknown tool: ${toolName}`);
  }

  return await executor(args, userId);
};