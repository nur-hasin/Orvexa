export const AI_CONFIG = {
  CHAT: {
    MODEL: "openrouter/free",
    TEMPERATURE: 0.7,
    MAX_TOKENS: 4096,
    MAX_HISTORY: 6,
    TIMEOUT: 60000,
  },

  TITLE: {
    MODEL: "openrouter/free",
    TEMPERATURE: 0,
    MAX_TOKENS: 264,
    MAX_WORDS: 6,
  },

  SUMMARY: {
    MODEL: "openrouter/free",
    TEMPERATURE: 0.2,
    WINDOW: 20,
    MAX_TOKENS: 512,
    MAX_WORDS: 120,
  },
};
