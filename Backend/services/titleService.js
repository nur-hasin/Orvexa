import { AI_CONFIG } from "../config/aiConfig.js";
import openRouterClient from "./openRouterClient.js";

const generateTitle = async (userMessage, attempt = 1) => {
  try {
    const { response, data } = await openRouterClient({
      model: AI_CONFIG.TITLE.MODEL,

      messages: [
        {
          role: "system",
          content: `
              You are a chat title generator.

              Your only task:
              Create a short, meaningful title that summarizes the user's message.

              STRICT OUTPUT RULES:
              - Return ONLY the title text.
              - Do not explain anything.
              - Do not describe your process.
              - Do not mention the user or the message.
              - Do not output analysis, reasoning, instructions, or examples.
              - Do not output phrases like "The user", "Intent", "Primary topic", "Summary", or "Rules".
              - Do not output sentences.
              - Maximum ${AI_CONFIG.TITLE.MAX_WORDS} words.
              - Use Title Case.
              - No quotes.
              - No punctuation.
              - No emojis.
              `,
        },
        {
          role: "user",
          content: `
              Generate a title for this conversation:
              ${userMessage}
              `,
        },
      ],

      temperature: AI_CONFIG.TITLE.TEMPERATURE,
      max_tokens: AI_CONFIG.TITLE.MAX_TOKENS,
    });

    if (!response.ok) {
      console.error("OpenRouter error:", JSON.stringify(data, null, 2));

      const retryAfter = data?.error?.metadata?.retry_after_seconds;

      if (retryAfter && attempt < 2) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryAfter * 1000 + 250),
        );
        return generateTitle(userMessage, attempt + 1);
      }

      throw new Error(data.error?.message || "Provider returned error");
    }

    const message = data?.choices?.[0]?.message;
    let title = message?.content?.trim();

    if (!title) {
      throw new Error("Invalid title returned by AI");
    }

    title = title
      .split("\n")
      .filter((line) => line.trim())
      .at(-1)
      .trim();

    title = title
      .replace(/^(title:|Title:)/i, "")
      .replace(/["']/g, "")
      .trim();

    title = title.split(/\s+/).slice(0, AI_CONFIG.TITLE.MAX_WORDS).join(" ");

    return title;
  } catch (err) {
    console.error(`Title Service (attempt ${attempt}):`, err.message);

    return null;
  }
};

export default generateTitle;
