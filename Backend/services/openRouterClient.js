import "dotenv/config";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const openRouterClient = async ({
  model,
  messages,
  temperature,
  max_tokens,
  signal,
}) => {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
    }),

    signal,
  });

  const data = await response.json();

  return {
    response,
    data,
  };
};

export default openRouterClient;
