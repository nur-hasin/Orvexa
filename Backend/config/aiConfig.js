export const AI_CONFIG = {
  CHAT: {
    MODEL: "openrouter/free",
    TEMPERATURE: 0.7,
    MAX_TOKENS: 2048,
    MAX_HISTORY: 6,
    TIMEOUT: 60000,
  },

  TITLE: {
    MODEL: "liquid/lfm-2.5-1.2b-instruct:free",
    TEMPERATURE: 0,
    MAX_TOKENS: 64,
    MAX_WORDS: 4,
  },

  SUMMARY: {
    MODEL: "liquid/lfm-2.5-1.2b-instruct:free",
    TEMPERATURE: 0.2,
    WINDOW: 20,
    MAX_TOKENS: 256,
    MAX_WORDS: 100,
  },
};
