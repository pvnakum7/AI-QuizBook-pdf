export function normalizeText(s = "") {
  return s.replace(/\s+/g, " ").replace(/[^\w\s]/g, "").toLowerCase().trim();
}

export function chunkArray(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

export function uuid() {
  return crypto.randomUUID();
}
