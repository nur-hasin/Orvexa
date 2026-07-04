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

const getOpenRouterAIAPIResponse = async (thread) => {
  const messages = buildContext(thread);

  const payload = {
    messages,
    temperature: AI_CONFIG.CHAT.TEMPERATURE,
    max_tokens: AI_CONFIG.CHAT.MAX_TOKENS,
  };

  let lastError = "Unknown error";

  for (const model of AI_CONFIG.CHAT.MODELS) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, AI_CONFIG.CHAT.TIMEOUT);

    try {
      const { response, data } = await openRouterClient({
        model,
        ...payload,
        signal: controller.signal,
      });

      if (!response.ok) {
        lastError = data.error?.message || `HTTP ${response.status}`;

        if (process.env.NODE_ENV !== "production") {
          console.warn(`✗ ${model} (${response.status}) - ${lastError}`);
        }

        // These errors won't succeed with another model
        if ([400, 401, 403].includes(response.status)) {
          throw new Error(lastError);
        }

        // Try the next model
        continue;
      }

      const content = data?.choices?.[0]?.message?.content;

      if (typeof content !== "string" || !content.trim()) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`${model} returned an empty response.`);
        }
        continue;
      }

      if (process.env.NODE_ENV !== "production") {
        console.log(`✓ Using model: ${model}`);
      }

      return content.trim();
    } catch (err) {
      if (err.name === "AbortError") {
        lastError = `${model} request timed out`;

        if (process.env.NODE_ENV !== "production") {
          console.warn(`✗ ${model} timed out`);
        }
      } else {
        lastError = err.message;

        if (process.env.NODE_ENV !== "production") {
          console.warn(`✗ ${model} - ${err.message}`);
        }
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(
    `All AI providers are currently unavailable. Please try again later. (${lastError})`,
  );
};

export default getOpenRouterAIAPIResponse;
