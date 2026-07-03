import "dotenv/config";
import { AI_CONFIG } from "../config/aiConfig.js";

const generateTitle = async (messages) => {
  try {
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

          messages: [
            {
              role: "system",
              content: `
                Generate a concise title.
                Maximum ${AI_CONFIG.TITLE.MAX_WORDS} words.
                Return only the title.`,
            },

            ...messages,
          ],

          temperature: AI_CONFIG.METADATA.TEMPERATURE,
          max_tokens: AI_CONFIG.TITLE.MAX_TOKENS,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to generate title");
    }

    return data.choices[0].message.content.trim();
  } catch (err) {
    console.error("Title Service:", err);

    return "New Chat";
  }
};

export default generateTitle;
