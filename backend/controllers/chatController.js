import { getLLMAnswer } from "../services/openaiService.js";
import { embedText, findSimilarChunks } from "../services/embeddingService.js";
import { logInfo } from "../lib/utils/logger.js";

export async function handleAsk(req, res) {
  try {
    const { question, documentId } = req.body;
    if (!question) return res.status(400).json({ error: "Question required" });

    const chunks = await findSimilarChunks(question, documentId);
    const context = chunks.map(c => c.text).join("\n---\n");

    const answer = await getLLMAnswer(question, context);
    logInfo(`Answered: ${question}`);

    res.json({
      answer,
      citations: chunks.map(c => ({
        chunkId: c.id,
        page: c.page,
        snippet: c.text.slice(0, 150),
        positions: c.positions || []
      }))
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
