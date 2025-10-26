import fs from "fs";
import path from "path";

export function saveJSON(folder, name, data) {
  const dir = path.join(process.cwd(), folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2));
}

export function readJSON(folder, name) {
  const file = path.join(process.cwd(), folder, name);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}
