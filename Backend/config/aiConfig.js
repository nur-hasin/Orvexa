export const AI_CONFIG = {
  CHAT: {
    MODELS: [
      "meta-llama/llama-3.3-70b-instruct:free",
      "qwen/qwen3-next-80b-a3b-instruct:free",
      "google/gemma-4-31b-it:free",
      "openai/gpt-oss-20b:free",
    ],
    TEMPERATURE: 0.7,
    MAX_TOKENS: 1024,
    MAX_HISTORY: 6,
    TIMEOUT: 10000,
  },

  TITLE: {
    MODEL: "liquid/lfm-2.5-1.2b-instruct:free",
    TEMPERATURE: 0,
    MAX_TOKENS: 32,
    MAX_WORDS: 6,
    CONTEXT_MESSAGES: 2,
  },

  SUMMARY: {
    MODEL: "liquid/lfm-2.5-1.2b-instruct:free",
    TEMPERATURE: 0.2,
    WINDOW: 20,
    MAX_TOKENS: 120,
    MAX_WORDS: 80,
  },
};
