/** TipTap / ProseMirror JSON → plain text */
export const extractPlainFromProseMirrorLike = (node, depth = 0) => {
  if (depth > 50 || node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node !== "object") return "";
  let out = "";
  if (typeof node.text === "string") out += node.text;
  if (node.attrs && typeof node.attrs === "object") {
    for (const key of ["label", "title", "name", "alt", "caption"]) {
      const v = node.attrs[key];
      if (typeof v === "string" && v.trim()) {
        out = out ? `${out} ${v.trim()}` : v.trim();
      }
    }
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      const piece = extractPlainFromProseMirrorLike(child, depth + 1);
      if (piece) out = out ? `${out} ${piece}` : piece;
    }
  }
  return out.replace(/\s+/g, " ").trim();
};

/** Coerce stored question/option content to a display string */
export const contentToDisplayString = (content) => {
  if (content == null || content === "") return "";
  if (typeof content === "string") return content;
  if (typeof content === "object") {
    const fromDoc = extractPlainFromProseMirrorLike(content);
    if (fromDoc) return fromDoc;
    if (typeof content.text === "string") return content.text;
    if (content.text && typeof content.text === "object") {
      const inner = extractPlainFromProseMirrorLike(content.text);
      if (inner) return inner;
    }
    for (const key of ["label", "title", "name", "alt"]) {
      const v = content[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return "";
  }
  return String(content);
};

/** Option row from API: string or { text, image_url, ... } */
export const optionTextFromApi = (opt) => {
  if (opt == null) return "";
  if (typeof opt === "string") return contentToDisplayString(opt);
  if (typeof opt === "object") {
    return contentToDisplayString(opt.text ?? opt.label ?? opt.value);
  }
  return "";
};

export const optionImageFromApi = (opt) => {
  if (opt == null || typeof opt !== "object") return null;
  return opt.image_url || opt.image || null;
};

export const optionRowHasContent = (opt) => {
  const t = optionTextFromApi(opt).trim();
  const img = optionImageFromApi(opt);
  return Boolean(t || (img && String(img).trim()));
};

const isGarbageImageRef = (url) =>
  typeof url === "string" &&
  (url.includes("GridFS") ||
    url.includes("gridfs") ||
    url.includes("ObjectId("));

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const resolveMediaUrl = (url) => {
  if (url == null || url === "") return null;
  const s = typeof url === "string" ? url.trim() : String(url);
  if (!s || isGarbageImageRef(s)) return null;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("//")) return `https:${s}`;
  if (s.startsWith("/")) return `${API_BASE}${s}`;
  return s;
};

/**
 * Normalize user/correct answer value(s) to sorted comma-separated option indices
 * so index-based answers ("0") match text-based correct_answers from the API.
 */
export const normalizeAnswersToIndexKey = (value, options) => {
  const opts = Array.isArray(options) ? options : [];
  const indices = [];

  const add = (i) => {
    if (Number.isFinite(i) && i >= 0 && i < opts.length) indices.push(i);
  };

  const findByTextOrImage = (raw) => {
    const s = String(raw).trim();
    if (!s) return;
    const want = s.toLowerCase();
    let i = opts.findIndex((o) => optionTextFromApi(o).trim().toLowerCase() === want);
    if (i >= 0) {
      add(i);
      return;
    }
    i = opts.findIndex((o) => {
      const img = optionImageFromApi(o);
      return img && String(img).trim() === s;
    });
    if (i >= 0) add(i);
  };

  const processOne = (a) => {
    if (a == null || a === "") return;
    const s = String(a).trim();
    if (/^\d+$/.test(s)) add(parseInt(s, 10));
    else if (/^[A-F]$/i.test(s)) add(s.toUpperCase().charCodeAt(0) - 65);
    else findByTextOrImage(s);
  };

  const list = Array.isArray(value) ? value : [value];
  for (const a of list) processOne(a);

  return [...new Set(indices)].sort((x, y) => x - y).join(",");
};
