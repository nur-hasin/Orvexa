import "dotenv/config";
import { AI_CONFIG } from "../config/aiConfig.js";

const updateSummary = async (thread) => {
  try {
    const recentMessages = thread.messages.slice(-AI_CONFIG.SUMMARY.WINDOW);

    const messages = [
      {
        role: "system",
        content: `
            Update the conversation summary.
            Keep under ${AI_CONFIG.SUMMARY.MAX_WORDS} words.
            Preserve important facts and user preferences.
            Return plain text only.
        `,
      },

      {
        role: "system",
        content: thread.summary
          ? `Conversation Summary:\n${thread.summary}`
          : "Conversation Summary:\nNone",
      },

      ...recentMessages,
    ];

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
          temperature: AI_CONFIG.METADATA.TEMPERATURE,
          max_tokens: AI_CONFIG.SUMMARY.MAX_TOKENS,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message);
    }

    return data.choices[0].message.content.trim();
  } catch (err) {
    console.error(err);
    return thread.summary;
  }
};

export default updateSummary;
