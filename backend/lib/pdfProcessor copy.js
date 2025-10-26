/**
 * FINAL: PDF Processor for Node 22
 * ---------------------------------
 * ✅ Uses the legacy build of pdfjs-dist (safe for Node)
 * ✅ Loads pdf-parse lazily to avoid the ENOENT bug
 * ✅ Extracts text & coordinates for highlighting
 * ✅ Splits text into chunks for embeddings / citations
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// 🧠 Use the LEGACY build for Node (browser build causes DOMMatrix errors)
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

let pdfParse; // lazy load pdf-parse to avoid the self-test bug

const { getDocument, GlobalWorkerOptions } = pdfjsLib;
if (GlobalWorkerOptions) GlobalWorkerOptions.workerSrc = false;

export default class PDFProcessor {
  constructor({ chunkSize = 800, chunkOverlap = 120 } = {}) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
    this.pdfDocument = null;
  }

  /** Extract text + positions from all pages */
  async extractTextWithPositions(buffer) {
    try {
      const loadingTask = getDocument({ data: new Uint8Array(buffer) });
      this.pdfDocument = await loadingTask.promise;

      const pages = [];
      const chunks = [];
      const mappings = [];

      for (let pageNum = 1; pageNum <= this.pdfDocument.numPages; pageNum++) {
        const page = await this.pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });

        let fullText = "";
        const positionMapping = [];
        let offset = 0;

        for (const item of textContent.items) {
          const str = item.str || "";
          if (!str.trim()) continue;

          const transform = item.transform || [1, 0, 0, 1, 0, 0];
          const x = transform[4] || 0;
          const y = transform[5] || 0;
          const width = item.width || str.length * 6;
          const height = item.height || 10;

          positionMapping.push({
            text: str,
            start: offset,
            end: offset + str.length,
            x,
            y,
            width,
            height,
          });

          fullText += str + " ";
          offset += str.length + 1;
        }

        const pageChunks = await this.createChunks(fullText, positionMapping, pageNum);

        pages.push(fullText);
        chunks.push(...pageChunks);
        mappings.push({ page: pageNum, items: positionMapping, viewport });
      }

      return { pages, chunks, positionMappings: mappings };
    } catch (err) {
      console.warn("⚠️ pdfjs-dist failed, switching to pdf-parse fallback:", err.message);
      return await this.extractWithPdfParse(buffer);
    }
  }

  /** Split a page’s text into chunks */
  async createChunks(text, positionMapping, pageNum) {
    const chunks = [];
    if (!text.trim()) return chunks;

    try {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: this.chunkSize,
        chunkOverlap: this.chunkOverlap,
      });

      const docs = await splitter.splitText(text);

      docs.forEach((chunk, i) => {
        const startIndex = text.indexOf(chunk);
        const endIndex = startIndex + chunk.length;
        const positions = this.mapChunkPositions(positionMapping, startIndex, endIndex);

        chunks.push({
          id: `chunk_${pageNum}_${i}`,
          page: pageNum,
          text: chunk.trim(),
          snippet: chunk.slice(0, 200),
          startIndex,
          endIndex,
          positions,
        });
      });
    } catch (err) {
      console.warn("⚠️ LangChain splitter failed, using fallback:", err.message);
      const size = this.chunkSize, overlap = this.chunkOverlap;
      let i = 0, id = 0;
      while (i < text.length) {
        const part = text.slice(i, i + size);
        const startIndex = i;
        const endIndex = startIndex + part.length;
        const positions = this.mapChunkPositions(positionMapping, startIndex, endIndex);

        chunks.push({
          id: `chunk_${pageNum}_${id}`,
          page: pageNum,
          text: part.trim(),
          snippet: part.slice(0, 200),
          startIndex,
          endIndex,
          positions,
        });

        i += size - overlap;
        id++;
      }
    }

    return chunks;
  }

  /** Map each chunk’s text range to its PDF coordinates */
  mapChunkPositions(positionMapping, startIndex, endIndex) {
    if (!Array.isArray(positionMapping)) return [];
    const positions = [];

    for (const item of positionMapping) {
      if (item.end <= startIndex || item.start >= endIndex) continue;
      positions.push({
        text: item.text,
        rect: { x: item.x, y: item.y, width: item.width, height: item.height },
        overlap: {
          start: Math.max(item.start, startIndex),
          end: Math.min(item.end, endIndex),
        },
      });
    }

    return positions;
  }

  /** Fallback extraction using pdf-parse (safe lazy import) */
  async extractWithPdfParse(buffer) {
    try {
      if (!pdfParse) {
        const imported = await import("pdf-parse");
        pdfParse = imported.default || imported;
      }
      const data = await pdfParse(buffer);
      const text = data.text || "";
      return {
        pages: [text],
        chunks: [
          {
            id: "chunk_1_0",
            page: 1,
            text,
            positions: [],
          },
        ],
        positionMappings: [],
      };
    } catch (e) {
      console.error("❌ pdf-parse fallback failed:", e.message);
      return { pages: [], chunks: [], positionMappings: [] };
    }
  }

  /** Cleanup */
  destroy() {
    try {
      if (this.pdfDocument?.destroy) this.pdfDocument.destroy();
    } catch {}
    this.pdfDocument = null;
  }
}
