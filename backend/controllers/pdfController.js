import fs from "fs";
import path from "path";
import PDFProcessor from "../lib/pdfProcessor.js";
import { logInfo, logError } from "../lib/utils/logger.js";

const uploadDir = path.join(process.cwd(), "data/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export async function handleUpload(buffer, filename) {
  try {
    const pdfPath = path.join(uploadDir, filename);
    fs.writeFileSync(pdfPath, buffer);
    logInfo(`Uploaded: ${filename}`);

    const processor = new PDFProcessor();
    const data = await processor.extractTextWithPositions(buffer);
    processor.destroy();

    // optionally persist metadata
    const metaPath = path.join(uploadDir, `${filename}.json`);
    fs.writeFileSync(metaPath, JSON.stringify(data, null, 2));

    return {
      message: "PDF processed successfully",
      totalPages: data.pages.length,
      chunks: data.chunks.length,
      file: filename
    };
  } catch (e) {
    logError(e);
    throw e;
  }
}
