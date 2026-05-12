"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const LOGO_CANDIDATES = [
  "/logo.svg",
  "/logo.png",
  "/logo.webp",
  "/favicon.ico",
  "/icon",
];

const sizeClasses = {
  sm: {
    logo: "h-8 w-8",
    title: "text-sm",
    subtitle: "text-[11px]",
  },
  md: {
    logo: "h-10 w-10",
    title: "text-base",
    subtitle: "text-xs",
  },
  lg: {
    logo: "h-12 w-12",
    title: "text-xl",
    subtitle: "text-sm",
  },
} as const;

interface BrandLogoProps {
  title?: string;
  subtitle?: string;
  size?: keyof typeof sizeClasses;
  centered?: boolean;
  className?: string;
  logoClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function BrandLogo({
  title = "LOGGERS",
  subtitle,
  size = "md",
  centered = false,
  className,
  logoClassName,
  titleClassName,
  subtitleClassName,
}: BrandLogoProps) {
  const [logoIndex, setLogoIndex] = useState(0);
  const logoSrc = LOGO_CANDIDATES[logoIndex];
  const initial = title.trim().charAt(0).toUpperCase() || "L";

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        centered && "flex-col text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-background/80 ring-1 ring-border/60",
          sizeClasses[size].logo,
          logoClassName,
        )}
      >
        {logoSrc ? (
          <img
            src={logoSrc}
            alt="Brand logo"
            className="h-full w-full object-contain p-1"
            onError={() => {
              setLogoIndex((current) => current + 1);
            }}
          />
        ) : (
          <span className="text-sm font-bold text-foreground">{initial}</span>
        )}
      </div>

      <div className={cn("min-w-0", centered && "text-center")}>
        <p
          className={cn(
            "truncate font-bold tracking-wide text-foreground",
            sizeClasses[size].title,
            titleClassName,
          )}
        >
          {title}
        </p>
        {subtitle ? (
          <p
            className={cn(
              "truncate text-muted-foreground",
              sizeClasses[size].subtitle,
              subtitleClassName,
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
