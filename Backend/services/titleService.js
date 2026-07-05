import { AI_CONFIG } from "../config/aiConfig.js";
import openRouterClient from "./openRouterClient.js";

const generateTitle = async (userMessage) => {
  try {
    const { response, data } = await openRouterClient({
      model: AI_CONFIG.TITLE.MODEL,

      messages: [
        {
          role: "system",
          content: `
                You generate concise conversation titles.

                Rules:
                - Identify the user's primary topic or intent.
                - Prefer descriptive titles over single words.
                - Include the main subject and, when possible, the purpose.
                - Maximum ${AI_CONFIG.TITLE.MAX_WORDS} words.
                - Use Title Case.
                - Do not use quotation marks.
                - Do not use emojis.
                - Do not end with punctuation.
                - Return ONLY the title.
        `},
        {
          role: "user",
          content: userMessage,
        },
      ],

      temperature: AI_CONFIG.TITLE.TEMPERATURE,
      max_tokens: AI_CONFIG.TITLE.MAX_TOKENS,
    });

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to generate title");
    }

    const title = data?.choices?.[0]?.message?.content;

    if (typeof title !== "string" || !title.trim()) {
      throw new Error("Invalid title returned by AI");
    }

    return title.trim();
  } catch (err) {
    console.error("Title Service:", err.message);

    // Fallback title
    return "New Chat";
  }
};

export default generateTitle;
