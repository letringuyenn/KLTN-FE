const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DEFAULT_FETCH_OPTIONS: RequestInit = {
  credentials: "include",
};

interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AnalysisResult {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        username: string;
        githubId: string;
        avatar?: string;
        role: "USER" | "ADMIN";
      };
  repoFullName: string;
  runId: string;
  branchName?: string;
  prNumber?: number | null;
  rawErrorSnippet: string;
  aiResult: {
    rootCause: string;
    suggestedFix: string;
  };
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  prUrl?: string;
  status: "PENDING" | "COMPLETED" | "PR_CREATED" | "FAILED";
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisHistoryResponse {
  analyses: AnalysisResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AnalysisJobSubmissionResponse {
  success: boolean;
  jobId: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  message?: string;
}

export interface AnalysisJobStatusResponse {
  success: boolean;
  jobId: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  result?: AnalysisResult;
  errorMessage?: string;
  message?: string;
}

export interface DocumentationDoc {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceTransaction {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        username: string;
        githubId: string;
        avatar?: string;
        role: "USER" | "ADMIN";
      };
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
}

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

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...DEFAULT_FETCH_OPTIONS,
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  let data: unknown;

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorPayload = data as
      | { error?: string; message?: string }
      | undefined;
    throw {
      message:
        errorPayload?.error || errorPayload?.message || "API request failed",
      status: response.status,
      data,
    } as ApiError;
  }

  return {
    success: true,
    data: data as T,
    ...(data as object),
  };
}

export const authApi = {
  async handleCallback(
    code: string,
    state: string,
  ): Promise<{ success: boolean; user: UserProfile }> {
    const response = await apiRequest<{ success: boolean; user: UserProfile }>(
      "/api/auth/github/callback",
      {
        method: "POST",
        body: JSON.stringify({ code, state }),
      },
    );
    return response.data as { success: boolean; user: UserProfile };
  },

  async getProfile(): Promise<UserProfile> {
    const response = await apiRequest<{ success: boolean; user: UserProfile }>(
      "/api/auth/profile",
    );
    return (response.data as { success: boolean; user: UserProfile }).user;
  },

  async logout(): Promise<void> {
    await apiRequest<{ success: boolean }>("/api/auth/logout", {
      method: "POST",
    });
  },
};

export const analysisApi = {
  async analyzeWorkflow(
    repoUrl: string,
    workflowRunId: string,
  ): Promise<AnalysisJobSubmissionResponse> {
    const response = await apiRequest<AnalysisJobSubmissionResponse>(
      "/api/analysis/analyze",
      {
        method: "POST",
        body: JSON.stringify({ repoUrl, workflowRunId }),
      },
    );
    return response.data as AnalysisJobSubmissionResponse;
  },

  async getAnalysisStatus(jobId: string): Promise<AnalysisJobStatusResponse> {
    const response = await apiRequest<AnalysisJobStatusResponse>(
      `/api/analysis/${jobId}/status`,
    );
    return response.data as AnalysisJobStatusResponse;
  },

  async createAutoFixPrById(
    analysisId: string,
  ): Promise<{ success: boolean; prUrl?: string }> {
    const response = await apiRequest<{ success: boolean; prUrl?: string }>(
      `/api/analysis/${analysisId}/create-pr`,
      {
        method: "POST",
      },
    );
    return response.data as { success: boolean; prUrl?: string };
  },

  async getHistory(
    page = 1,
    limit = 10,
  ): Promise<{
    analyses: AnalysisResult[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const response = await apiRequest<{
      analyses: AnalysisResult[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/api/analysis/history?page=${page}&limit=${limit}`);
    return response.data as {
      analyses: AnalysisResult[];
      pagination: { page: number; limit: number; total: number; pages: number };
    };
  },
};

export const adminApi = {
  async getStats(): Promise<{
    users: number;
    admins: number;
    totalAnalyses: number;
    analysesByStatus: Record<string, number>;
  }> {
    const response = await apiRequest<{
      users: number;
      admins: number;
      totalAnalyses: number;
      analysesByStatus: Record<string, number>;
    }>("/api/admin/stats");
    return response.data as {
      users: number;
      admins: number;
      totalAnalyses: number;
      analysesByStatus: Record<string, number>;
    };
  },

  async getLogs(
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<{
    logs: AnalysisResult[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const query = new URLSearchParams();
    query.append("page", page.toString());
    query.append("limit", limit.toString());
    if (status) query.append("status", status);
    const response = await apiRequest<{
      logs: AnalysisResult[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/api/admin/logs?${query}`);
    return response.data as {
      logs: AnalysisResult[];
      pagination: { page: number; limit: number; total: number; pages: number };
    };
  },

  async syncKnowledge(): Promise<{
    success: boolean;
    message: string;
    syncedCount: number;
  }> {
    const response = await apiRequest<{
      success: boolean;
      message: string;
      syncedCount: number;
    }>("/api/admin/ai/sync-knowledge", {
      method: "POST",
    });
    return response.data as {
      success: boolean;
      message: string;
      syncedCount: number;
    };
  },

  async updateUserAccess(
    userId: string,
    role: "USER" | "ADMIN",
    tier: "FREE" | "PRO",
  ): Promise<UserProfile> {
    const response = await apiRequest<{ user: UserProfile }>(
      `/api/admin/users/${userId}/access`,
      {
        method: "PUT",
        body: JSON.stringify({ role, tier }),
      },
    );
    return (response.data as { user: UserProfile }).user;
  },

  async getFinanceSummary(): Promise<{
    monthlyPriceUsd: number;
    proUsers: number;
    totalUsers: number;
    totalProfitUsd: number;
  }> {
    const response = await apiRequest<{
      finance: {
        monthlyPriceUsd: number;
        proUsers: number;
        totalUsers: number;
        totalProfitUsd: number;
      };
    }>("/api/admin/finance/summary");
    return (
      response.data as {
        finance: {
          monthlyPriceUsd: number;
          proUsers: number;
          totalUsers: number;
          totalProfitUsd: number;
        };
      }
    ).finance;
  },

  async getUsers(
    page = 1,
    limit = 20,
  ): Promise<{
    users: UserProfile[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const response = await apiRequest<{
      users: UserProfile[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/api/admin/users?page=${page}&limit=${limit}`);
    return response.data as {
      users: UserProfile[];
      pagination: { page: number; limit: number; total: number; pages: number };
    };
  },

  async getDocs(
    page = 1,
    limit = 20,
  ): Promise<{
    docs: DocumentationDoc[];
    pagination?: { page: number; limit: number; total: number; pages: number };
  }> {
    const response = await apiRequest<{
      docs: DocumentationDoc[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/api/admin/docs?page=${page}&limit=${limit}`);
    return response.data as {
      docs: DocumentationDoc[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  },

  async getDocById(id: string): Promise<DocumentationDoc | null> {
    const response = await apiRequest<{
      success: boolean;
      doc: DocumentationDoc | null;
    }>(`/api/admin/docs/${id}`);
    return (response.data as { success: boolean; doc: DocumentationDoc | null })
      .doc;
  },

  async createDoc(input: {
    title: string;
    category?: string;
    content: string;
    isPublished?: boolean;
  }): Promise<DocumentationDoc> {
    const response = await apiRequest<{
      success: boolean;
      doc: DocumentationDoc;
    }>("/api/admin/docs", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return (response.data as { success: boolean; doc: DocumentationDoc }).doc;
  },

  async updateDoc(
    id: string,
    input: {
      title?: string;
      category?: string;
      content?: string;
      isPublished?: boolean;
    },
  ): Promise<DocumentationDoc> {
    const response = await apiRequest<{
      success: boolean;
      doc: DocumentationDoc;
    }>(`/api/admin/docs/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return (response.data as { success: boolean; doc: DocumentationDoc }).doc;
  },

  async deleteDoc(id: string): Promise<void> {
    await apiRequest(`/api/admin/docs/${id}`, { method: "DELETE" });
  },
};

export const adminFinanceApi = {
  async getTransactions(): Promise<FinanceTransaction[]> {
    const response = await apiRequest<{ transactions: FinanceTransaction[] }>(
      "/api/admin/finance/transactions",
    );
    return (response.data as { transactions: FinanceTransaction[] }).transactions || [];
  },
};

export const userApi = {
  async updateSettings(username: string): Promise<UserProfile> {
    const response = await apiRequest<{ user: UserProfile }>(
      "/api/users/settings",
      {
        method: "PUT",
        body: JSON.stringify({ username }),
      },
    );
    return (response.data as { user: UserProfile }).user;
  },

  async updateByok(
    geminiApiKey: string,
  ): Promise<{ hasCustomGeminiKey: boolean }> {
    const response = await apiRequest<{ hasCustomGeminiKey: boolean }>(
      "/api/users/byok",
      {
        method: "PUT",
        body: JSON.stringify({ geminiApiKey }),
      },
    );
    return response.data as { hasCustomGeminiKey: boolean };
  },

  async clearByok(): Promise<{ hasCustomGeminiKey: boolean }> {
    const response = await apiRequest<{ hasCustomGeminiKey: boolean }>(
      "/api/users/byok",
      {
        method: "PUT",
        body: JSON.stringify({ clear: true }),
      },
    );
    return response.data as { hasCustomGeminiKey: boolean };
  },
};

export const feedbackApi = {
  async getNotifications(): Promise<{
    notifications: {
      _id: string;
      message: string;
      adminReply: string;
      createdAt: string;
      updatedAt: string;
    }[];
    unreadCount: number;
  }> {
    const response = await apiRequest<{
      notifications: {
        _id: string;
        message: string;
        adminReply: string;
        createdAt: string;
        updatedAt: string;
      }[];
      unreadCount: number;
    }>("/api/feedback/notifications");
    return response.data as {
      notifications: {
        _id: string;
        message: string;
        adminReply: string;
        createdAt: string;
        updatedAt: string;
      }[];
      unreadCount: number;
    };
  },

  async markAsRead(feedbackId: string): Promise<void> {
    await apiRequest<{ success: boolean }>(`/api/feedback/${feedbackId}/read`, {
      method: "PUT",
    });
  },
};

export const paymentApi = {
  async demoCheckout(): Promise<{
    success: boolean;
    message: string;
    user: UserProfile;
    redirectUrl?: string;
  }> {
    const response = await apiRequest<{
      success: boolean;
      message: string;
      user: UserProfile;
      redirectUrl?: string;
    }>("/api/payment/demo-checkout", {
      method: "POST",
    });
    return response.data as {
      success: boolean;
      message: string;
      user: UserProfile;
      redirectUrl?: string;
    };
  },
};

export const documentationApi = {
  async getPublishedDocs(): Promise<DocumentationDoc[]> {
    const response = await apiRequest<{ docs: DocumentationDoc[] }>(
      "/api/docs/public",
    );
    return (response.data as { docs: DocumentationDoc[] }).docs || [];
  },

  async getPublishedDocBySlug(slug: string): Promise<DocumentationDoc | null> {
    const response = await apiRequest<{ doc: DocumentationDoc | null }>(
      `/api/docs/public/${slug}`,
    );
    return (response.data as { doc: DocumentationDoc | null }).doc;
  },
};

export function getGitHubAuthUrl(): string {
  return `${API_URL}/api/auth/github/login`;
}

export default {
  authApi,
  analysisApi,
  adminApi,
  userApi,
  feedbackApi,
  adminFinanceApi,
  getGitHubAuthUrl,
};
