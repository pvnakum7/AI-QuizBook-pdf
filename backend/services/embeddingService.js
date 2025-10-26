import fs from "fs";
import path from "path";
import { normalizeText } from "../lib/utils/textUtils.js";

const vectorDir = path.join(process.cwd(), "data/vectors");
if (!fs.existsSync(vectorDir)) fs.mkdirSync(vectorDir, { recursive: true });

export async function embedText(text) {
  const words = normalizeText(text).split(" ");
  return words.reduce((acc, w) => acc + w.charCodeAt(0), 0) / words.length;
}

export async function findSimilarChunks(question, documentId) {
  const docPath = path.join(process.cwd(), "data/uploads", `${documentId}.json`);
  if (!fs.existsSync(docPath)) return [];

  const doc = JSON.parse(fs.readFileSync(docPath));
  const qVec = await embedText(question);

  return doc.chunks
    .map(c => ({ ...c, score: Math.abs(qVec - (c.text.length % 1000)) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
}
