import { getOptimizedImageUrl } from "@/utils/imageUtils";

export function buildTiptapImageStyle(width, align = "left") {
  const parts = ["height: auto", "max-width: 100%", "display: block"];
  if (width) {
    parts.push(`width: ${width}px`);
  }
  if (align === "center") {
    parts.push("margin-left: auto", "margin-right: auto");
  } else if (align === "right") {
    parts.push("margin-left: auto", "margin-right: 0");
  } else {
    parts.push("margin-left: 0", "margin-right: auto");
  }
  return parts.join("; ");
}

export function parseTiptapImageWidth(element) {
  if (!element) return null;

  const fromAttr = element.getAttribute?.("width");
  if (fromAttr) {
    const parsed = parseInt(String(fromAttr).replace(/px$/i, ""), 10);
    if (Number.isFinite(parsed)) return parsed;
  }

  const fromStyleProp = element.style?.width;
  if (fromStyleProp) {
    const parsed = parseInt(String(fromStyleProp).replace(/px$/i, ""), 10);
    if (Number.isFinite(parsed)) return parsed;
  }

  const styleAttr = element.getAttribute?.("style") || "";
  const match = styleAttr.match(/width\s*:\s*(\d+(?:\.\d+)?)\s*px/i);
  if (match) {
    return Math.round(parseFloat(match[1]));
  }

  return null;
}

export function parseTiptapImageAlign(element) {
  if (!element) return "left";

  const fromData = element.getAttribute?.("data-align");
  if (fromData === "center" || fromData === "right" || fromData === "left") {
    return fromData;
  }

  const styleAttr = element.getAttribute?.("style") || "";
  const marginLeft =
    element.style?.marginLeft ||
    styleAttr.match(/margin-left\s*:\s*([^;]+)/i)?.[1]?.trim() ||
    "";
  const marginRight =
    element.style?.marginRight ||
    styleAttr.match(/margin-right\s*:\s*([^;]+)/i)?.[1]?.trim() ||
    "";

  if (marginLeft === "auto" && marginRight === "auto") return "center";
  if (marginLeft === "auto" && (marginRight === "0" || marginRight === "0px")) {
    return "right";
  }

  return "left";
}

function readAttr(attrs, name) {
  const doubleQuoted = attrs.match(
    new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, "i")
  );
  if (doubleQuoted) return doubleQuoted[1];

  const singleQuoted = attrs.match(
    new RegExp(`\\s${name}\\s*=\\s*'([^']*)'`, "i")
  );
  if (singleQuoted) return singleQuoted[1];

  return "";
}

/** Normalize saved TipTap image tags for consistent public display (SSR-safe). */
export function normalizeTiptapImagesForDisplay(html) {
  if (!html || typeof html !== "string") return html;

  let result = html.replace(
    /<div[^>]*>\s*(<img\b[^>]*>)\s*<\/div>/gi,
    "$1"
  );

  result = result.replace(/<img\b([^>]*)\/?>/gi, (full, attrs) => {
    const src = readAttr(attrs, "src").trim();
    if (!src) return full;

    const alt = readAttr(attrs, "alt");
    const styleAttr = readAttr(attrs, "style");
    const pseudoElement = {
      getAttribute(name) {
        if (name === "src") return src;
        if (name === "alt") return alt;
        if (name === "style") return styleAttr;
        if (name === "width") return readAttr(attrs, "width");
        if (name === "data-align") return readAttr(attrs, "data-align");
        return "";
      },
      style: {},
    };

    const width = parseTiptapImageWidth(pseudoElement);
    const align = parseTiptapImageAlign(pseudoElement);
    const style = buildTiptapImageStyle(width, align);

    const altPart = alt ? ` alt="${alt.replace(/"/g, "&quot;")}"` : "";
    const widthPart = width ? ` width="${width}"` : "";
    const heightPart = width ? ` height="${Math.round(width * 0.5625)}"` : "";

    let displaySrc = src.replace(/"/g, "&quot;");
    if (src.includes("res.cloudinary.com")) {
      displaySrc = getOptimizedImageUrl(
        src,
        width || 800,
        width ? Math.round(width * 0.5625) : null
      ).replace(/"/g, "&quot;");
    }

    return `<img src="${displaySrc}" data-align="${align}" style="${style}" loading="lazy" decoding="async"${altPart}${widthPart}${heightPart}>`;
  });

  return result;
}
