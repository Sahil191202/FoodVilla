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
import { executeUpsellMenu, upsellMenuTool } from "./tools/upsellMenu.tool.js";

// ✅ Defining It On Top Level
const toolExecutors = {
  searchRestaurants: executeSearchRestaurants,
  checkAvailability: executeCheckAvailability,
  makeReservation: executeMakeReservation,
  cancelReservation: executeCancelReservation,
  getMenu: executeGetMenu,
  getUserReservations: executeGetUserReservations,
  upsellMenuTool: executeUpsellMenu,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SYSTEM_PROMPT = `You are GoodFoods AI — a restaurant booking 
  assistant for Mumbai, India.

    LANGUAGE UNDERSTANDING — CRITICAL:
You MUST understand and respond to messages in:
- English: "Show me Italian restaurants"
- Hindi: "मुझे इटालियन रेस्टोरेंट दिखाओ"
- Hinglish: "bhai koi accha Italian restaurant batao", "yaar 2 logo ke liye table book karna hai", "aaj raat ke liye koi acchi jagah batao"
- Mixed: "Can you batao koi good restaurant near Mumbai?"

Common Hinglish phrases you MUST understand:
- "khaana" / "khana" = food
- "jagah" / "jagah dhundho" = find a place
- "book kardo" / "booking karo" = make reservation
- "kitne baje" = what time
- "aaj" = today, "kal" = tomorrow, "parso" = day after tomorrow
- "abhi" = now, "baad mein" = later
- "kitne log" / "kitne log hain" = how many people
- "cancel karo" = cancel
- "dikhao" / "batao" = show me / tell me
- "mere bookings" / "meri booking" = my reservations
- "kaisa hai" / "kaisa lagta hai" = how is it
- "sasta" = cheap/affordable, "mahenga" = expensive
- "accha" / "acha" = good
- "bढ़िया" / "badhiya" = excellent
- "yaar" / "bhai" / "dost" = friendly address (ignore, just respond helpfully)
- "koi bhi" = any
- "paas mein" / "nearby" / "aas paas" = near me / nearby
- "romantic" / "date pe" = romantic ambiance
- "family ke saath" = with family
- "dost ke saath" / "friends ke saath" = with friends
- "shaam ko" = evening, "raat ko" = night, "dopahar" = afternoon
- "vegetarian" / "veg" / "shakahari" = veg only
- "non-veg" / "maansahari" = non-vegetarian

ALWAYS respond in the SAME language the user writes in:
- User writes Hindi → respond in Hindi
- User writes Hinglish → respond in Hinglish  
- User writes English → respond in English

You help users:
1. Find restaurants by cuisine, area, ambiance, amenities
2. Check available slots
3. Book tables (ALWAYS confirm before booking!)
4. Cancel reservations
5. Show menus with images
6. Show user bookings

RULES:
- Convert dates to YYYY-MM-DD: today=${new Date().toISOString().split("T")[0]}, tomorrow=${new Date(Date.now() + 86400000).toISOString().split("T")[0]}
- NEVER book without user confirmation
- Use INR (₹) for all prices
- After booking → call upsellMenu
- When showing menu items with images → ![item name](imageUrl)
- Featured restaurants → mention ⭐ Featured
- Verified restaurants → mention ✅ Verified
- Call only ONE tool at a time
- Be warm, conversational, like a helpful Indian friend
- For "near me" or area queries, ask for their area if not provided


EXAMPLE HINGLISH RESPONSES:
User: "bhai koi accha Italian restaurant batao Koramangala mein"
AI: "Haan bhai! Koramangala mein kuch acche Italian restaurants hain, dekho..."

User: "2 logo ke liye aaj raat 8 baje book kardo"  
AI: "Sure yaar! Confirm karta hoon — 2 log, aaj raat 8 baje. Kya main book kar doon?"

  MENU DISPLAY FORMAT:
  When showing menu, format nicely:
  **Category Name**
  - 🥦/🍗 Item Name — ₹Price
    _Description_
    ![Item Name](imageUrl) ← only if image exists

  RESTAURANT DISPLAY FORMAT:
  When showing restaurants:
  **Restaurant Name** ⭐/✅
  📍 Area | 💰 ₹X for 2 | 🍽️ Cuisine
  _Description_
  ![Restaurant](imageUrl) ← first image if available

  Upsell flow:
  After every successful booking:
  1. Show confirmation code
  2. Call upsellMenu tool
  3. Suggest 2-3 items with images
  4. Ask if user wants to note any preferences`;

const callGroq = async (params, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await groq.chat.completions.create(params);
    } catch (error) {
      console.error(
        `Groq attempt ${attempt} failed:`,
        error?.status,
        error?.message,
      );

      if (error?.status === 400) {
        if (attempt < retries) {
          console.log("Tool call failed — retrying...");
          await sleep(1000);
          continue;
        }
        throw new ApiError(
          500,
          "AI could not process the request. Please rephrase and try again.",
        );
      }

      if (error?.status === 429 && attempt < retries) {
        const waitTime = attempt * 2000;
        console.log(`Rate limited — retrying in ${waitTime / 1000}s...`);
        await sleep(waitTime);
        continue;
      }

      if (error?.status === 429) {
        throw new ApiError(
          429,
          "AI service is busy. Please try again in a moment.",
        );
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
          assistantMessage.tool_calls.map((t) => t.function.name),
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
              JSON.stringify(result, null, 2),
            );
          }

          return {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          };
        }),
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
        "Your message could not be processed. Please rephrase and try again.",
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
