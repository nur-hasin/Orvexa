import { AI_CONFIG } from "../config/aiConfig.js";
import openRouterClient from "./openRouterClient.js";

const updateSummary = async (thread) => {
  try {
    const recentMessages = thread.messages.slice(-AI_CONFIG.SUMMARY.WINDOW);

    const messages = [
      {
        role: "system",
        content: `
            Update the conversation summary.
            Rules:
            - Keep under ${AI_CONFIG.SUMMARY.MAX_WORDS} words.
            - Preserve important user facts, preferences, and ongoing tasks.
            - Remove unnecessary details.
            - Return plain text only.
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

    const { response, data } = await openRouterClient({
      model: AI_CONFIG.SUMMARY.MODEL,
      messages,
      temperature: AI_CONFIG.SUMMARY.TEMPERATURE,
      max_tokens: AI_CONFIG.SUMMARY.MAX_TOKENS,
    });

    if (!response.ok) {
      throw new Error(data.error?.message || "Summary generation failed");
    }

    const summary = data?.choices?.[0]?.message?.content;

    if (typeof summary !== "string" || !summary.trim()) {
      throw new Error("Invalid summary returned by AI");
    }

    return summary.trim();
  } catch (err) {
    console.error("Summary Service:", err.message);

    // Keep previous summary if updating fails
    return thread.summary;
  }
};

export default updateSummary;
