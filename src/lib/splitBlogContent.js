/** Split HTML blog content near the middle so an inline slider can sit between blocks. */
export function splitBlogContentAtMiddle(html) {
  const source = String(html || "").trim();
  if (!source) {
    return { before: "", after: "" };
  }

  const blockParts = source.split(/(?<=<\/(?:p|h[1-6]|li|blockquote|div)>)/i);
  if (blockParts.length > 1) {
    const mid = Math.ceil(blockParts.length / 2);
    return {
      before: blockParts.slice(0, mid).join(""),
      after: blockParts.slice(mid).join(""),
    };
  }

  const mid = Math.floor(source.length / 2);
  return {
    before: source.slice(0, mid),
    after: source.slice(mid),
  };
}
