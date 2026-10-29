"use client";

import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { isBackendUploadImage } from "@/lib/image";

export interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = "/img/home1.png";

export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  unoptimized,
  style,
  ...rest
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<any>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  const isExternal =
    typeof imgSrc === "string" &&
    (imgSrc.startsWith("http://") || imgSrc.startsWith("https://"));

  const shouldUnoptimize =
    unoptimized ??
    (isBackendUploadImage(typeof imgSrc === "string" ? imgSrc : "") || isExternal);

  return (
    <Image
      {...rest}
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt || "Chỗ nghỉ Homestay"}
      unoptimized={shouldUnoptimize}
      style={{
        objectFit: "cover",
        ...style,
      }}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
