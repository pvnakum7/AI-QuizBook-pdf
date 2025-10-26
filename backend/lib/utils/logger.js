import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, "../../data/cache");

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

function write(level, msg) {
  const time = new Date().toISOString();
  const line = `[${time}] [${level}] ${msg}\n`;
  fs.appendFileSync(path.join(logDir, "server.log"), line);
  console.log(line.trim());
}

export const logInfo = (m) => write("INFO", m);
export const logError = (m) => write("ERROR", m);
