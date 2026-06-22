const SKIP_WEBP_CONVERSION = new Set(["image/webp", "image/svg+xml"]);

/**
 * Convert PNG/JPEG/GIF/etc. to WebP in the browser before upload.
 * SVG and already-WebP files are returned unchanged.
 */
export async function convertImageFileToWebp(
  file,
  { quality = 0.85, maxWidth = 2048, maxHeight = 2048 } = {}
) {
  if (!file || typeof File === "undefined") {
    throw new Error("No image file provided");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload a valid image file");
  }

  if (SKIP_WEBP_CONVERSION.has(file.type)) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageElement(objectUrl);
    let { width, height } = image;

    const widthScale = width > maxWidth ? maxWidth / width : 1;
    const heightScale = height > maxHeight ? maxHeight / height : 1;
    const scale = Math.min(widthScale, heightScale, 1);

    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to prepare image for conversion");
    }

    ctx.drawImage(image, 0, 0, width, height);

    const blob = await canvasToWebpBlob(canvas, quality);
    if (!blob) {
      throw new Error("WebP conversion failed");
    }

    const baseName = String(file.name || "image")
      .replace(/\.[^.]+$/, "")
      .trim() || "image";

    return new File([blob], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for conversion"));
    img.src = src;
  });
}

function canvasToWebpBlob(canvas, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/webp", quality);
  });
}

/** Ensure Cloudinary delivery URLs use WebP format. */
export function ensureCloudinaryWebpUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/f_webp") || /\.webp(?:\?|$)/i.test(url)) return url;
  return url.replace("/upload/", "/upload/f_webp/");
}
