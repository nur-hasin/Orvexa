import 'dotenv/config';

const getOpenRouterAIAPIResponse = async (message) => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
          max_tokens: 100,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Something went wrong");
    }

    return data.choices[0].message.content;
  } catch (err) {
    console.error("Error:", err);
    throw new Error("Failed to generate response");
  }
};

export default getOpenRouterAIAPIResponse;