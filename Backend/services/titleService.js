import { AI_CONFIG } from "../config/aiConfig.js";
import openRouterClient from "./openRouterClient.js";

const generateTitle = async (messages) => {
  try {
    const { response, data } = await openRouterClient({
      model: AI_CONFIG.TITLE.MODEL,

      messages: [
        {
          role: "system",
          content: `
                Generate a short conversation title.
                Rules:
                - Maximum ${AI_CONFIG.TITLE.MAX_WORDS} words.
                - No explanations.
                - No line breaks.
                - No quotation marks.
                - No punctuation at the end.
                - Return ONLY the title.
          `,
        },

        ...messages,
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
