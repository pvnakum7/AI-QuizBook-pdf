// backend/controllers/askController.js
import { getLLMAnswer } from "../services/openaiService.js";
import fs from "fs";
import path from "path";

export async function askQuestion(req, res) {
  try {
    const { question, documentId } = req.body;
    const filePath = path.resolve("data/uploads", `${documentId}.json`);

    if (!fs.existsSync(filePath))
      return res.status(404).json({ error: "Document not found" });

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const context = data.chunks.map((c) => c.text).join("\n\n");

    const answer = await getLLMAnswer(question, context);

    // minimal citation mock (you can improve later)
    const citations = data.chunks.slice(0, 2).map((c) => ({
      chunkId: c.id,
      page: c.page,
      snippet: c.snippet,
      positions: c.positions,
    }));

    res.json({ answer, citations });
  } catch (err) {
    console.error("AskController error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
