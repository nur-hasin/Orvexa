// using OpenRouter with npm
// import OpenAI from "openai";
// import "dotenv/config";

// const client = new OpenAI({
//   apiKey: process.env.OPENROUTER_API_KEY,
//   baseURL: "https://openrouter.ai/api/v1",
// });

// const response = await client.chat.completions.create({
//   model: "openai/gpt-4o-mini",
//   max_tokens: 100,
//   messages: [
//     {
//       role: "user",
//       content: "Joke relevant to software engineering",
//     },
//   ],
// });

// console.log(response.choices[0].message.content);

// using OpenRouter with api endpoints
// import express from "express";
// import cors from "cors";
// import "dotenv/config";

// const app = express();
// const port = 8080;

// app.use(cors());
// app.use(express.json());

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

// app.post("/api/generate", async (req, res) => {
//   try {
//     const response = await fetch(
//       "https://openrouter.ai/api/v1/chat/completions",
//       {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           model: "openai/gpt-4o-mini",
//           messages: [
//             {
//               role: "user",
//               content: req.body.message,
//             },
//           ],
//           max_tokens: 100,
//         }),
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       return res.status(response.status).json({
//         error: data.error?.message || "Something went wrong",
//       });
//     }

//     res.json({
//       result: data.choices[0].message.content,
//     });
//   } catch (error) {
//     console.error("Error:", error);

//     res.status(500).json({
//       error: "Failed to generate response",
//     });
//   }
// });

import express from "express";
import cors from "cors";
import "dotenv/config";
import chatRoutes from "./routes/chatRoutes.js";
import connectDB from "./config/dbConfig.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.use("/api", chatRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDB();
});