export const AI_CONFIG = {
  METADATA: {
    MODEL: "openai/gpt-oss-20b:free",
    TEMPERATURE: 0.2,
  },

  CHAT: {
    TEMPERATURE: 0.7,
    MAX_TOKENS: 1024,
    MAX_HISTORY: 6,
  },

  SUMMARY: {
    WINDOW: 20,
    MAX_TOKENS: 120,
    MAX_WORDS: 80,
  },

  TITLE: {
    MAX_TOKENS: 20,
    MAX_WORDS: 6,
    CONTEXT_MESSAGES: 2,
  },
};
