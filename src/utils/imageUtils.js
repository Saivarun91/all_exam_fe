/**
 * Transform Cloudinary image URL to requested size
 * @param {string} url - Original Cloudinary URL
 * @param {number} width - Desired width in pixels
 * @param {number} height - Optional desired height in pixels
 * @returns {string} - Transformed URL with size parameters
 */
// export function getOptimizedImageUrl(url, width, height = null) {
//   if (!url || typeof url !== 'string') {
//     return url;
//   }

//   // Check if it's a Cloudinary URL
//   if (url.includes('res.cloudinary.com')) {
//     try {
//       // Parse URL to handle query parameters
//       let urlObj;
//       try {
//         urlObj = new URL(url);
//       } catch (e) {
//         // If URL parsing fails, try to work with the string directly
//         urlObj = null;
//       }
      
//       // Remove query parameters that might conflict (like ?w=800)
//       let cleanUrl = url;
//       if (urlObj) {
//         const params = new URLSearchParams(urlObj.search);
//         params.delete('w');
//         params.delete('h');
//         params.delete('width');
//         params.delete('height');
//         const newQuery = params.toString();
//         cleanUrl = urlObj.origin + urlObj.pathname + (newQuery ? '?' + newQuery : '');
//       }
      
//       // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
//       const uploadIndex = cleanUrl.indexOf('/upload/');
//       if (uploadIndex === -1) {
//         return url; // Not a valid Cloudinary URL format
//       }

//       // Split URL at /upload/
//       const beforeUpload = cleanUrl.substring(0, uploadIndex + 8); // Include '/upload/'
//       let afterUpload = cleanUrl.substring(uploadIndex + 8);
      
//       // Check if transformations already exist (they would be before the filename)
//       // Format: /upload/transformation1,transformation2/filename.ext
//       const pathParts = afterUpload.split('/');
      
//       // If first part looks like transformations (contains underscores or commas), remove size params
//       if (pathParts.length > 1) {
//         const firstPart = pathParts[0];
//         // Check if it contains transformation parameters
//         if (firstPart.includes('w_') || firstPart.includes('h_') || firstPart.includes('c_') || firstPart.includes('q_')) {
//           // Remove existing w_ and h_ parameters
//           let transformations = firstPart
//             .split(',')
//             .filter(t => !t.startsWith('w_') && !t.startsWith('h_'))
//             .join(',');
          
//           // Build new transformation string
//           let newTransformation = `w_${width}`;
//           if (height) {
//             newTransformation += `,h_${height}`;
//           }
//           newTransformation += ',c_limit,q_auto,f_auto';
          
//           // Combine transformations
//           if (transformations) {
//             newTransformation = `${newTransformation},${transformations}`;
//           }
          
//           // Reconstruct URL
//           pathParts[0] = newTransformation;
//           return `${beforeUpload}${pathParts.join('/')}`;
//         }
//       }

//       // No existing transformations, add new ones
//       // Build transformation string
//       let transformation = `w_${width}`;
//       if (height) {
//         transformation += `,h_${height}`;
//       }
//       transformation += ',c_limit,q_auto,f_auto'; // c_limit maintains aspect ratio, q_auto for quality, f_auto for format

//       // Insert transformation after '/upload/'
//       return `${beforeUpload}${transformation}/${afterUpload}`;
//     } catch (e) {
//       // If anything fails, return original URL
//       console.warn('Error optimizing image URL:', e);
//       return url;
//     }
//   }

//   // Not a Cloudinary URL, return as-is
//   return url;
// }




/**
 * @param {string} url
 * @param {number} width
 * @param {number|null} height
 * @param {'limit'|'pad'|'fill'|'fit'} [crop='limit'] - pad/fill return a fixed canvas (good for uniform logos)
 */
export function getOptimizedImageUrl(url, width, height = null, crop = 'limit') {
  if (!url || typeof url !== 'string') {
    return url;
  }

  // SVG logos/icons: serve directly (same as admin preview); transforms can break vectors.
  if (/\.svg(?:\?|$)/i.test(url)) {
    return url;
  }

  const cropMode = ['limit', 'pad', 'fill', 'fit'].includes(crop) ? crop : 'limit';

  if (url.includes('res.cloudinary.com')) {
    try {
      let urlObj;
      try {
        urlObj = new URL(url);
      } catch (e) {
        urlObj = null;
      }

      let cleanUrl = url;
      if (urlObj) {
        const params = new URLSearchParams(urlObj.search);
        params.delete('w');
        params.delete('h');
        params.delete('width');
        params.delete('height');
        const newQuery = params.toString();
        cleanUrl = urlObj.origin + urlObj.pathname + (newQuery ? '?' + newQuery : '');
      }

      const uploadIndex = cleanUrl.indexOf('/upload/');
      if (uploadIndex === -1) return url;

      const beforeUpload = cleanUrl.substring(0, uploadIndex + 8);
      let afterUpload = cleanUrl.substring(uploadIndex + 8);

      const pathParts = afterUpload.split('/');

      if (pathParts.length > 1) {
        const firstPart = pathParts[0];

        if (
          firstPart.includes('w_') ||
          firstPart.includes('h_') ||
          firstPart.includes('c_') ||
          firstPart.includes('q_')
        ) {
          let transformations = firstPart
            .split(',')
            .filter(
              (t) =>
                !t.startsWith('w_') &&
                !t.startsWith('h_') &&
                !t.startsWith('c_')
            )
            .join(',');

          let newTransformation = `w_${width}`;
          if (height) newTransformation += `,h_${height}`;

          newTransformation += `,c_${cropMode},q_auto:eco,f_auto,fl_strip_profile`;

          if (transformations) {
            newTransformation = `${newTransformation},${transformations}`;
          }

          pathParts[0] = newTransformation;
          return `${beforeUpload}${pathParts.join('/')}`;
        }
      }

      let transformation = `w_${width}`;
      if (height) transformation += `,h_${height}`;

      transformation += `,c_${cropMode},q_auto:eco,f_auto,fl_strip_profile`;

      return `${beforeUpload}${transformation}/${afterUpload}`;

    } catch (e) {
      console.warn('Error optimizing image URL:', e);
      return url;
    }
  }

  return url;
}

const LOCAL_IMAGE_HOSTS = new Set(["images.unsplash.com", "res.cloudinary.com"]);

/** Resolve backend media/API paths to an absolute URL the browser can load. */
export function resolvePublicImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/api/")) {
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(
      /\/$/,
      ""
    );
    return `${base}${trimmed}`;
  }
  return trimmed;
}

function getApiImageHostname() {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    if (!base) return null;
    return new URL(base).hostname;
  } catch {
    return null;
  }
}

/** Whether Next.js <Image> can optimize this src (WebP/AVIF + sizing). */
export function isNextOptimizableSrc(src) {
  if (!src || typeof src !== "string") return false;
  const resolved = resolvePublicImageUrl(src);
  if (/\.svg(?:\?|$)/i.test(resolved)) return false;
  if (resolved.startsWith("/") && !resolved.startsWith("//")) return true;

  try {
    const { hostname, protocol } = new URL(resolved);
    if (protocol !== "http:" && protocol !== "https:") return false;
    // Next.js blocks private/local upstreams in the image optimizer (SSRF protection).
    if (
      hostname === "127.0.0.1" ||
      hostname === "localhost" ||
      hostname.endsWith(".local")
    ) {
      return false;
    }
    if (LOCAL_IMAGE_HOSTS.has(hostname)) return true;
    const apiHost = getApiImageHostname();
    if (apiHost && hostname === apiHost) return true;
    return false;
  } catch {
    return false;
  }
}

export function resolveOptimizedSrc(src, width, height = null, crop = "limit") {
  const resolved = resolvePublicImageUrl(src);
  if (!resolved) return "";
  if (resolved.includes("res.cloudinary.com")) {
    return getOptimizedImageUrl(resolved, width, height, crop);
  }
  return resolved;
}
