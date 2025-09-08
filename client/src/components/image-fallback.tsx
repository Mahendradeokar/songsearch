import React, { useState } from "react";
import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";

type ImageWithFallbackProps = Omit<
  ComponentProps<"img">,
  "onError" | "onLoad"
> & {
  src: string;
  alt?: string;
  errorFallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (e: unknown) => void;
};

export const DefaultImageErrorFallback = ({
  className,
  errorFallback,
}: {
  className?: string;
  errorFallback?: React.ReactNode;
}) => (
  <div className={cn("h-full overflow-hidden", className)}>
    {errorFallback ?? (
      <div className="w-full h-full bg-red-50 border text-muted-foreground text-sm flex items-center justify-center">
        Failed to load image
      </div>
    )}
  </div>
);

export const DefaultImageLoadingFallback = ({
  className,
  loadingFallback,
}: {
  className?: string;
  loadingFallback?: React.ReactNode;
}) => (
  <div className={cn("h-full overflow-hidden", className)}>
    {loadingFallback ?? (
      <div className="w-full h-full bg-muted text-muted-foreground text-sm flex items-center justify-center animate-pulse">
        Loading image...
      </div>
    )}
  </div>
);

export const ImageWithFallback = ({
  src,
  alt = "",
  errorFallback,
  loadingFallback,
  onLoad,
  onError,
  className,
  ...imgProps
}: ImageWithFallbackProps) => {
  const [status, setStatus] = useState<"loaded" | "error" | "loading">(
    "loading"
  );

  const invalidSrc = !src || src.trim().length < 3;
  if (invalidSrc && status !== "error") {
    setStatus("error");
    return null;
  }

  return (
    <>
      {status === "loading" && (
        <DefaultImageLoadingFallback
          className={className}
          loadingFallback={loadingFallback}
        />
      )}
      {status === "error" && (
        <DefaultImageErrorFallback
          className={className}
          errorFallback={errorFallback}
        />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => {
          setStatus("loaded");
          onLoad?.();
        }}
        onError={(e) => {
          setStatus("error");
          onError?.(e);
        }}
        {...imgProps}
        className={className}
        style={{
          ...(imgProps.style || {}),
          ...(status === "loading" && {
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
          }),
          ...(status === "error" && {
            display: "none",
          }),
        }}
      />
    </>
  );
};
