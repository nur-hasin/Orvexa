import "dotenv/config";

const requiredEnv = ["OPENROUTER_API_KEY", "MONGODB_URI"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});
