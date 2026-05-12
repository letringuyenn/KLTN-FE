export interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  role: "USER" | "ADMIN";
  tier?: "FREE" | "PRO";
  analyzeCount?: number;
  lastResetDate?: string;
  isFirstLogin?: boolean;
  githubId?: string;
  hasCustomGeminiKey?: boolean;
}

const AVATAR_FIELD_CANDIDATES = [
  "avatar",
  "avatar_url",
  "avatarUrl",
  "image",
  "imageUrl",
  "picture",
  "photo",
];

export function resolveAvatarUrl(raw: unknown): string | undefined {
  if (typeof raw === "string") {
    const value = raw.trim();

    if (
      value.length > 0 &&
      (value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("/") ||
        value.startsWith("data:"))
    ) {
      return value;
    }

    return undefined;
  }

  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const payload = raw as Record<string, unknown>;

  for (const fieldName of AVATAR_FIELD_CANDIDATES) {
    const value = payload[fieldName];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

export function normalizeUserProfile(raw: unknown): UserProfile {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      username: "GitHub User",
      role: "USER",
      tier: "FREE",
      analyzeCount: 0,
    };
  }

  const payload = raw as Record<string, unknown>;
  const role = payload.role === "ADMIN" ? "ADMIN" : "USER";
  const username =
    typeof payload.username === "string" && payload.username.trim().length > 0
      ? payload.username.trim()
      : "GitHub User";
  const id =
    typeof payload.id === "string" && payload.id.trim().length > 0
      ? payload.id
      : "";

  const normalized: UserProfile = {
    id,
    username,
    role,
  };

  const avatar = resolveAvatarUrl(payload);

  if (avatar) {
    normalized.avatar = avatar;
  }

  if (
    typeof payload.githubId === "string" &&
    payload.githubId.trim().length > 0
  ) {
    normalized.githubId = payload.githubId;
  }

  if (role === "USER") {
    normalized.tier = payload.tier === "PRO" ? "PRO" : "FREE";
    normalized.isFirstLogin = payload.isFirstLogin === true;
    normalized.hasCustomGeminiKey = payload.hasCustomGeminiKey === true;
    normalized.analyzeCount =
      typeof payload.analyzeCount === "number" &&
      Number.isFinite(payload.analyzeCount)
        ? Math.max(0, Math.floor(payload.analyzeCount))
        : 0;

    if (
      typeof payload.lastResetDate === "string" &&
      payload.lastResetDate.trim().length > 0
    ) {
      normalized.lastResetDate = payload.lastResetDate;
    }
  }

  return normalized;
}
