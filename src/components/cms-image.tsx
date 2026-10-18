import { useState } from "react";

export function CmsImage({
  src,
  fallback,
  alt,
  focalX,
  focalY,
  className,
  width,
  height,
  loading = "lazy",
}: {
  src: string | null;
  fallback: string | null;
  alt: string;
  focalX: number;
  focalY: number;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
}) {
  const [broken, setBroken] = useState(false);
  const chosen = !broken && src ? src : fallback;
  if (!chosen) {
    return <div className={className} style={{ background: "var(--muted)" }} aria-hidden />;
  }
  return (
    <img
      src={chosen}
      alt={alt}
      className={className}
      style={{ objectPosition: `${focalX}% ${focalY}%` }}
      loading={loading}
      onError={() => {
        if (src && fallback) setBroken(true);
      }}
      {...(width != null ? { width } : {})}
      {...(height != null ? { height } : {})}
    />
  );
}
