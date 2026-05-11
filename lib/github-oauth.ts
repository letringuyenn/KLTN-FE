import { getGitHubAuthUrl, authApi } from "./api-client";

function getAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_APP_URL || "";
}

export interface AuthResponse {
  success: boolean;
  user?: any;
  error?: string;
  debug?: {
    status?: number;
    data?: unknown;
    details?: unknown;
    reason?: string;
  };
}

export const GITHUB_OAUTH_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
  REDIRECT_URI: `${getAppOrigin()}/auth/callback`,
  SCOPE: "user:email repo",
  STATE_LENGTH: 32,
};

export const getGitHubOAuthURL = getGitHubAuthUrl;

export function generateRandomState(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const exchangeCodeForToken = async (
  code: string,
  state: string,
): Promise<AuthResponse> => {
  try {
    if (!code) {
      return { success: false, error: "Authorization code is required" };
    }

    const data = await authApi.handleCallback(code, state);
    return { success: true, user: data.user };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Authentication failed on server",
      debug: {
        status: err?.status,
        data: err?.data,
      },
    };
  }
};

export const validateOAuthState = (_state: string): boolean => true;
