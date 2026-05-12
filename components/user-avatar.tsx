"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  fallbackClassName?: string;
}

function getInitials(name?: string | null) {
  const normalizedName = name?.trim();

  if (!normalizedName) {
    return "U";
  }

  return normalizedName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

export function UserAvatar({
  src,
  name,
  size = "md",
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "size-6",
    md: "size-8",
    lg: "size-16",
  } as const;

  return (
    <Avatar className={cn("overflow-hidden", sizeClasses[size], className)}>
      <AvatarImage
        src={src ?? undefined}
        alt={name ? `${name}'s avatar` : "User avatar"}
        className="object-cover"
      />
      <AvatarFallback
        className={cn(
          "bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-semibold text-white",
          fallbackClassName,
        )}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
