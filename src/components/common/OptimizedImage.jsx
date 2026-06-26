// import Image from "next/image";
// import {
//   isNextOptimizableSrc,
//   resolveOptimizedSrc,
// } from "@/utils/imageUtils";

// /**
//  * Public-site image: Next.js Image (WebP/AVIF) when possible, with reserved layout space for CLS.
//  */
// export default function OptimizedImage({
//   src,
//   alt = "",
//   width,
//   height,
//   fill = false,
//   priority = false,
//   className = "",
//   sizes,
//   crop = "limit",
//   style,
//   containerClassName = "",
//   aspectRatio,
//   objectFit,
//   onError,
//   fallbackSrc,
// }) {
//   if (!src) return null;

//   const resolvedSrc = resolveOptimizedSrc(src, width, height, crop);
//   const useNext = isNextOptimizableSrc(resolvedSrc);
//   const fit =
//     objectFit ||
//     style?.objectFit ||
//     (/\bobject-contain\b/.test(className) ? "contain" : undefined) ||
//     (/\bobject-cover\b/.test(className) ? "cover" : undefined) ||
//     "cover";

//   if (fill || aspectRatio) {
//     const ratio =
//       aspectRatio || (width && height ? `${width} / ${height}` : undefined);

//     return (
//       <div
//         className={`relative overflow-hidden ${
//           fill ? "absolute inset-0 h-full w-full" : ""
//         } ${containerClassName}`.trim()}
//         style={{
//           aspectRatio: fill ? undefined : ratio,
//           ...(width && !fill ? { width } : null),
//         }}
//       >
//         {useNext ? (
//           <Image
//             src={resolvedSrc}
//             alt={alt}
//             fill
//             className={className}
//             sizes={sizes || "100vw"}
//             priority={priority}
//             style={{ objectFit: fit, ...style }}
//             // onError={onError}
//           />
//         ) : (
//           <img
//             src={resolvedSrc}
//             alt={alt}
//             className={`absolute inset-0 h-full w-full ${className}`.trim()}
//             loading={priority ? "eager" : "lazy"}
//             fetchPriority={priority ? "high" : undefined}
//             decoding="async"
//             style={{ objectFit: fit, ...style }}
//             onError={(event) => {
//               if (fallbackSrc && event.currentTarget.src !== fallbackSrc) {
//                 event.currentTarget.src = fallbackSrc;
//               }
//               onError?.(event);
//             }}
//           />
//         )}
//       </div>
//     );
//   }

//   if (useNext) {
//     return (
//       <Image
//         src={resolvedSrc}
//         alt={alt}
//         width={width}
//         height={height}
//         className={className}
//         sizes={sizes}
//         priority={priority}
//         style={{ objectFit: fit, ...style }}
//         onError={onError}
//       />
//     );
//   }

//   return (
//     <img
//       src={resolvedSrc}
//       alt={alt}
//       width={width}
//       height={height}
//       className={className}
//       loading={priority ? "eager" : "lazy"}
//       fetchPriority={priority ? "high" : undefined}
//       decoding="async"
//       sizes={sizes}
//       style={{ objectFit: fit, ...style }}
//       onError={(event) => {
//         if (fallbackSrc && event.currentTarget.src !== fallbackSrc) {
//           event.currentTarget.src = fallbackSrc;
//         }
//         onError?.(event);
//       }}
//     />
//   );
// }




import Image from "next/image";
import {
  isNextOptimizableSrc,
  resolveOptimizedSrc,
} from "@/utils/imageUtils";

/**
 * Public-site image component.
 * Shows the entire uploaded image without cropping.
 */
export default function OptimizedImage({
  src,
  alt = "",
  width,
  height,
  fill = false,
  priority = false,
  className = "",
  sizes,
  crop = "limit",
  style = {},
  containerClassName = "",
  aspectRatio,
  objectFit = "contain", // Default = contain
  fallbackSrc,
}) {
  if (!src) return null;

  const resolvedSrc = resolveOptimizedSrc(src, width, height, crop);
  const useNext = isNextOptimizableSrc(resolvedSrc);

  const fit =
    objectFit ||
    style.objectFit ||
    (/\bobject-cover\b/.test(className) ? "cover" : "contain");

  if (fill || aspectRatio) {
    const ratio =
      aspectRatio || (width && height ? `${width} / ${height}` : undefined);

    return (
      <div
        className={`relative overflow-hidden ${
          fill ? "absolute inset-0 h-full w-full" : ""
        } ${containerClassName}`.trim()}
        style={{
          aspectRatio: fill ? undefined : ratio,
          ...(width && !fill ? { width } : {}),
        }}
      >
        {useNext ? (
          <Image
            src={resolvedSrc}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes || "100vw"}
            className={className}
            unoptimized
            style={{
              objectFit: fit,
              ...style,
            }}
          />
        ) : (
          <img
            src={resolvedSrc}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            className={`absolute inset-0 h-full w-full ${className}`.trim()}
            style={{
              objectFit: fit,
              ...style,
            }}
          />
        )}
      </div>
    );
  }

  if (useNext) {
    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={className}
        unoptimized
        style={{
          objectFit: fit,
          ...style,
        }}
      />
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      sizes={sizes}
      className={className}
      style={{
        objectFit: fit,
        ...style,
      }}
    />
  );
}