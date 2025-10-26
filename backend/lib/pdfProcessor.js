/**
 * FINAL PDF Processor for Node 22 + pdfjs-dist v4.4.168
 * -----------------------------------------------------
 * ✅ Uses pdfjs-dist legacy ESM build (safe for Node)
 * ✅ No dependency on pdf-parse
 * ✅ No workerSrc assignment (fixes type error)
 * ✅ Extracts text + coordinates
 */

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// 🧩 Minimal DOM stubs for Node
// global.DOMMatrix ??= class DOMMatrix {};
// global.document ??= {};
// global.window ??= { document: global.document };
// 🧩 Minimal DOM stubs (scoped only for pdfjs)
const fakeDOM = {
  DOMMatrix: class DOMMatrix {},
  document: {},
  window: { document: {} },
};

// Attach temporarily for pdfjs to load
const originalWindow = global.window;
const originalDocument = global.document;
const originalDOMMatrix = global.DOMMatrix;

global.window = fakeDOM.window;
global.document = fakeDOM.document;
global.DOMMatrix = fakeDOM.DOMMatrix;

// ✅ Import pdfjs safely inside fake DOM context
// import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Restore global environment
global.window = originalWindow;
global.document = originalDocument;
global.DOMMatrix = originalDOMMatrix;

// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";


// ✅ Setup pdfjs (no GlobalWorkerOptions)
const { getDocument } = pdfjsLib;

export default class PDFProcessor {
  constructor({ chunkSize = 800, chunkOverlap = 120 } = {}) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
    this.pdfDocument = null;
  }

  /** Extract text + positional info from all PDF pages */
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
      console.warn("⚠️ pdfjs-dist parsing failed:", err.message);
      return await this.simpleTextExtraction(buffer);
    }
  }

  /** Split text into chunks using LangChain splitter */
  async createChunks(text, positionMapping, pageNum) {
    const chunks = [];
    if (!text?.trim()) return chunks;

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
      const size = this.chunkSize;
      const overlap = this.chunkOverlap;
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

  /** Map text spans to coordinates */
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

  /** Simplified fallback extraction */
  async simpleTextExtraction(buffer) {
    try {
      const loadingTask = getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        fullText += content.items.map((i) => i.str).join(" ") + "\n";
      }

      return {
        pages: [fullText],
        chunks: [
          {
            id: "chunk_1_0",
            page: 1,
            text: fullText.trim(),
            positions: [],
          },
        ],
        positionMappings: [],
      };
    } catch (err) {
      console.error("❌ simpleTextExtraction failed:", err.message);
      return { pages: [], chunks: [], positionMappings: [] };
    }
  }

  /** Cleanup */
  destroy() {
    try {
      if (this.pdfDocument?.destroy) this.pdfDocument.destroy();
    } catch (err) {
      console.warn("Destroy failed:", err.message);
    } finally {
      this.pdfDocument = null;
    }
  }
}
