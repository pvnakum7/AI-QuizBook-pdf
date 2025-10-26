// backend/services/openaiService.js
import axios from "axios";

/**
 * Returns a valid API key each time (so it reads after dotenv.config()).
 */
function getKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.error("❌ Missing OPENAI_API_KEY in environment at runtime");
    throw new Error("Server missing OPENAI_API_KEY");
  }
  return key;
}

/**
 * Send question + context to OpenAI API and return answer text.
 */
export async function getLLMAnswer(question, context) {
   if (process.env.USE_MOCK === "true") {
    console.log("⚙️ Mock mode active – returning fake answer");
    return `Mock answer for "${question}" (context length: ${context.length} chars).`;
  }

  try {
    const prompt = `Answer the question using the following context only. Be concise.\n\nContext:\n${context}\n\nQuestion: ${question}`;

    const endpoint = "https://api.openai.com/v1/chat/completions";

    



    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that answers based on provided documents only."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getKey()}`, // ✅ resolved at runtime
        },
        timeout: 20000,
      }
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error("❌ OpenAI API error:", err.response?.status, err.response?.data || err.message);
    throw new Error(err.response?.data?.error?.message || err.message);
  }
}
