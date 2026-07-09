import SYSTEM_PROMPT from "../constants/systemPrompt.js";
import { AI_CONFIG } from "../config/aiConfig.js";
import openRouterClient from "./openRouterClient.js";

const buildContext = (thread) => {
  const context = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
  ];

  if (thread.summary) {
    context.push({
      role: "system",
      content: `Conversation summary:\n${thread.summary}`,
    });
  }

  context.push(...thread.messages.slice(-AI_CONFIG.CHAT.MAX_HISTORY));

  return context;
};

export class RateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = "RateLimitError";
    this.isRateLimit = true;
  }
}

const getOpenRouterAIAPIResponse = async (thread) => {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, AI_CONFIG.CHAT.TIMEOUT);

  try {
    const { response, data } = await openRouterClient({
      model: AI_CONFIG.CHAT.MODEL,
      messages: buildContext(thread),
      temperature: AI_CONFIG.CHAT.TEMPERATURE,
      max_tokens: AI_CONFIG.CHAT.MAX_TOKENS,
      signal: controller.signal,
    });

    if (!response.ok) {
      if (/rate limit exceeded/i.test(data?.error?.message || "")) {
        throw new RateLimitError(
          "You've reached the current usage limit. Please try again in a few moments.",
        );
      }
      throw new Error(data?.error?.message || "AI request failed");
    }

    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      throw new Error("AI returned an empty response.");
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`✓ Using model: ${AI_CONFIG.CHAT.MODEL}`);
    }

    return content.trim();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("AI request timed out.");
    }

    throw err;
  } finally {
    clearTimeout(timeout);
  }
};

export default getOpenRouterAIAPIResponse;
