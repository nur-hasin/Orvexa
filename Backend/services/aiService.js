import "dotenv/config";
import SYSTEM_PROMPT from "../constants/systemPrompt.js";
import { AI_CONFIG } from "../config/aiConfig.js";

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

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_CONFIG.METADATA.MODEL,
        messages,
        temperature: AI_CONFIG.CHAT.TEMPERATURE,
        max_tokens: AI_CONFIG.CHAT.MAX_TOKENS,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "AI request failed");
  }

  return data.choices[0].message.content;
};

export default getOpenRouterAIAPIResponse;
