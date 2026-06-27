import Image from "next/image";
import {
  isNextOptimizableSrc,
  resolveOptimizedSrc,
} from "@/utils/imageUtils";

/**
 * Public-site image: Next.js Image (WebP/AVIF) when possible, with reserved layout space for CLS.
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
  style,
  containerClassName = "",
  aspectRatio,
  objectFit,
  onError,
  fallbackSrc,
}) {
  if (!src) return null;

  const resolvedSrc = resolveOptimizedSrc(src, width, height, crop);
  const useNext = isNextOptimizableSrc(resolvedSrc);
  const fit =
    objectFit ||
    style?.objectFit ||
    (/\bobject-contain\b/.test(className) ? "contain" : undefined) ||
    (/\bobject-cover\b/.test(className) ? "cover" : undefined) ||
    "cover";
  const imageErrorProps = onError ? { onError } : {};
  const fallbackErrorProps =
    fallbackSrc || onError
      ? {
          onError: (event) => {
            if (fallbackSrc && event.currentTarget.src !== fallbackSrc) {
              event.currentTarget.src = fallbackSrc;
            }
            onError?.(event);
          },
        }
      : {};

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
          ...(width && !fill ? { width } : null),
        }}
      >
        {useNext ? (
          <Image
            src={resolvedSrc}
            alt={alt}
            fill
            className={className}
            sizes={sizes || "100vw"}
            priority={priority}
            style={{ objectFit: fit, ...style }}
            {...imageErrorProps}
          />
        ) : (
          <img
            src={resolvedSrc}
            alt={alt}
            className={`absolute inset-0 h-full w-full ${className}`.trim()}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            style={{ objectFit: fit, ...style }}
            {...fallbackErrorProps}
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
        className={className}
        sizes={sizes}
        priority={priority}
        style={{ objectFit: fit, ...style }}
        {...imageErrorProps}
      />
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      sizes={sizes}
      style={{ objectFit: fit, ...style }}
    {...fallbackErrorProps}
    />
  );
}
