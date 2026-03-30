import { groq } from "../config/groq.js";
import { allTools } from "./tools/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ENV } from "../config/env.js";

// ✅ Importing Tools
import { executeSearchRestaurants } from "./tools/searchRestaurants.tool.js";
import { executeCheckAvailability } from "./tools/checkAvailability.tool.js";
import { executeMakeReservation } from "./tools/makeReservation.tool.js";
import { executeCancelReservation } from "./tools/cancelReservation.tool.js";
import { executeGetMenu } from "./tools/getMenu.tool.js";
import { executeGetUserReservations } from "./tools/getUserReservations.tool.js";

// ✅ Defining It On Top Level
const toolExecutors = {
  searchRestaurants: executeSearchRestaurants,
  checkAvailability: executeCheckAvailability,
  makeReservation: executeMakeReservation,
  cancelReservation: executeCancelReservation,
  getMenu: executeGetMenu,
  getUserReservations: executeGetUserReservations,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SYSTEM_PROMPT = `You are GoodFoods AI — a restaurant booking assistant for Mumbai, India.

You help users:
1. Find restaurants by cuisine and area
2. Check available slots
3. Book tables
4. Cancel reservations
5. View menu and suggest dishes
6. Show user bookings

Rules:
- Always confirm details before booking or cancelling
- Use tools to get real data — never make up restaurants
- IMPORTANT: Always convert dates to YYYY-MM-DD format before passing to any tool
  - "today" = ${new Date().toISOString().split("T")[0]}
  - "tomorrow" = ${new Date(Date.now() + 86400000).toISOString().split("T")[0]}
  - Always calculate actual date for "this Saturday", "next Friday" etc
- Use INR for prices
- After booking show confirmation code clearly
- Be friendly and conversational
- Call only ONE tool at a time`;

const callGroq = async (params, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await groq.chat.completions.create(params);
    } catch (error) {
      console.error(
        `Groq attempt ${attempt} failed:`,
        error?.status,
        error?.message
      );

      if (error?.status === 400) {
        if (attempt < retries) {
          console.log("Tool call failed — retrying...");
          await sleep(1000);
          continue;
        }
        throw new ApiError(
          500,
          "AI could not process the request. Please rephrase and try again."
        );
      }

      if (error?.status === 429 && attempt < retries) {
        const waitTime = attempt * 2000;
        console.log(`Rate limited — retrying in ${waitTime / 1000}s...`);
        await sleep(waitTime);
        continue;
      }

      if (error?.status === 429) {
        throw new ApiError(429, "AI service is busy. Please try again in a moment.");
      }
      if (error?.status === 401) {
        throw new ApiError(500, "Invalid Groq API key.");
      }

      throw new ApiError(500, "Failed to get response from AI service.");
    }
  }

  throw new ApiError(429, "AI service is busy. Please try again in a moment.");
};

export const runAgent = async (messages, userId) => {
  const fullMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ];

  const MAX_ITERATIONS = 10;
  let iterations = 0;
  const toolsUsed = [];

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    if (ENV.NODE_ENV === "development") {
      console.log(`\n--- Agent iteration ${iterations} ---`);
    }

    const response = await callGroq({
      model: "llama-3.3-70b-versatile",
      messages: fullMessages,
      tools: allTools,
      tool_choice: "auto",
      temperature: 0.3,
      max_tokens: 1024,
      parallel_tool_calls: false,
    });

    const assistantMessage = response.choices[0].message;
    const finishReason = response.choices[0].finish_reason;

    if (ENV.NODE_ENV === "development") {
      console.log("Finish reason:", finishReason);
    }

    fullMessages.push(assistantMessage);

    // Tool calls
    if (
      finishReason === "tool_calls" &&
      assistantMessage.tool_calls?.length > 0
    ) {
      if (ENV.NODE_ENV === "development") {
        console.log(
          "Tools requested:",
          assistantMessage.tool_calls.map((t) => t.function.name)
        );
      }

      const toolResultMessages = await Promise.all(
        assistantMessage.tool_calls.map(async (toolCall) => {
          const toolName = toolCall.function.name;

          let toolArgs;
          try {
            toolArgs = JSON.parse(toolCall.function.arguments);
          } catch {
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

          // ✅ Use top level toolExecutors map directly!
          let result;
          try {
            const executor = toolExecutors[toolName];

            if (!executor) {
              console.error(`No executor found for tool: ${toolName}`);
              console.log("Available tools:", Object.keys(toolExecutors));
              result = {
                success: false,
                error: `Unknown tool: ${toolName}`,
                suggestion: "Please inform the user and suggest alternatives",
              };
            } else {
              result = await executor(toolArgs, userId);
            }
          } catch (error) {
            if (ENV.NODE_ENV === "development") {
              console.error(`Tool ${toolName} failed:`, error.message);
            }
            result = {
              success: false,
              error: error.message || "Tool execution failed",
              suggestion: "Please inform the user and suggest alternatives",
            };
          }

          if (ENV.NODE_ENV === "development") {
            console.log(
              `Result from ${toolName}:`,
              JSON.stringify(result, null, 2)
            );
          }

          return {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          };
        })
      );

      fullMessages.push(...toolResultMessages);
      continue;
    }

    // Final response
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

    if (finishReason === "length") {
      return {
        finalMessage:
          assistantMessage.content +
          "\n\n_(Response was cut short. Please ask me to continue!)_",
        toolsUsed,
        iterations,
      };
    }

    if (finishReason === "content_filter") {
      throw new ApiError(
        400,
        "Your message could not be processed. Please rephrase and try again."
      );
    }

    break;
  }

  throw new ApiError(500, "Could not complete your request. Please try again.");
};

// ✅ executeTool exported separately for direct testing
export const executeTool = async (toolName, args, userId) => {
  const executor = toolExecutors[toolName];

  if (!executor) {
    throw new ApiError(400, `Unknown tool: ${toolName}`);
  }

  return await executor(args, userId);
};
