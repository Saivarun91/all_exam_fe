/**
 * Transform Cloudinary image URL to requested size
 * @param {string} url - Original Cloudinary URL
 * @param {number} width - Desired width in pixels
 * @param {number} height - Optional desired height in pixels
 * @returns {string} - Transformed URL with size parameters
 */
export function getOptimizedImageUrl(url, width, height = null) {
  if (!url || typeof url !== 'string') {
    return url;
  }

  // Check if it's a Cloudinary URL
  if (url.includes('res.cloudinary.com')) {
    try {
      // Parse URL to handle query parameters
      let urlObj;
      try {
        urlObj = new URL(url);
      } catch (e) {
        // If URL parsing fails, try to work with the string directly
        urlObj = null;
      }
      
      // Remove query parameters that might conflict (like ?w=800)
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
      
      // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
      const uploadIndex = cleanUrl.indexOf('/upload/');
      if (uploadIndex === -1) {
        return url; // Not a valid Cloudinary URL format
      }

      // Split URL at /upload/
      const beforeUpload = cleanUrl.substring(0, uploadIndex + 8); // Include '/upload/'
      let afterUpload = cleanUrl.substring(uploadIndex + 8);
      
      // Check if transformations already exist (they would be before the filename)
      // Format: /upload/transformation1,transformation2/filename.ext
      const pathParts = afterUpload.split('/');
      
      // If first part looks like transformations (contains underscores or commas), remove size params
      if (pathParts.length > 1) {
        const firstPart = pathParts[0];
        // Check if it contains transformation parameters
        if (firstPart.includes('w_') || firstPart.includes('h_') || firstPart.includes('c_') || firstPart.includes('q_')) {
          // Remove existing w_ and h_ parameters
          let transformations = firstPart
            .split(',')
            .filter(t => !t.startsWith('w_') && !t.startsWith('h_'))
            .join(',');
          
          // Build new transformation string
          let newTransformation = `w_${width}`;
          if (height) {
            newTransformation += `,h_${height}`;
          }
          newTransformation += ',c_limit,q_auto,f_auto';
          
          // Combine transformations
          if (transformations) {
            newTransformation = `${newTransformation},${transformations}`;
          }
          
          // Reconstruct URL
          pathParts[0] = newTransformation;
          return `${beforeUpload}${pathParts.join('/')}`;
        }
      }

      // No existing transformations, add new ones
      // Build transformation string
      let transformation = `w_${width}`;
      if (height) {
        transformation += `,h_${height}`;
      }
      transformation += ',c_limit,q_auto,f_auto'; // c_limit maintains aspect ratio, q_auto for quality, f_auto for format

      // Insert transformation after '/upload/'
      return `${beforeUpload}${transformation}/${afterUpload}`;
    } catch (e) {
      // If anything fails, return original URL
      console.warn('Error optimizing image URL:', e);
      return url;
    }
  }

  // Not a Cloudinary URL, return as-is
  return url;
}

