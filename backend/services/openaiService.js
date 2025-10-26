// backend/services/openaiService.js
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
/**
 * Universal LLM connector for ChatGPT (OpenAI) and DeepSeek.
 * Select which provider to use from your .env file:
 *
 * PROVIDER=openai
 * OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
 *
 * OR
 *
 * PROVIDER=deepseek
 * DEEPSEEK_API_KEY=ds-xxxxxxxxxxxxxxxxxxxx
 */

const PROVIDER = process.env.PROVIDER || "openai";
let API_KEY = "";
let API_URL = "";
let MODEL = "";

switch (PROVIDER.toLowerCase()) {
  case "deepseek":
    API_KEY = process.env.DEEPSEEK_API_KEY;
    API_URL = "https://api.deepseek.com/v1/chat/completions";
    MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
    break;

  case "openai":
  default:
    API_KEY = process.env.OPENAI_API_KEY;
    API_URL = "https://api.openai.com/v1/chat/completions";
    MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
    break;
}

if (!API_KEY) {
  console.error(`❌ Missing API key for provider: ${PROVIDER}`);
}

/**
 * getLLMAnswer()
 * Sends the user's question + context to the chosen LLM provider
 */
export async function getLLMAnswer(question, context) {
  try {
    if (!API_KEY) {
      throw new Error(`Missing API key for ${PROVIDER}`);
    }

    const prompt = `Answer the question using only the following context. Be concise and factual.\n\nContext:\n${context}\n\nQuestion: ${question}`;

    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages: [
          { role: "system", content: "You are a helpful assistant that answers based on provided documents only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    return content || "No response from model.";
  } catch (err) {
    console.error(
      `❌ ${PROVIDER.toUpperCase()} API error:`,
      err.response?.status,
      err.response?.data || err.message
    );

    throw new Error(err.response?.data?.error?.message || err.message);
  }
}
