"use client";

import { useEffect, useState } from "react";
import { adminApi, adminFinanceApi } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

interface FinanceData {
  monthlyPriceUsd: number;
  proUsers: number;
  totalUsers: number;
  totalProfitUsd: number;
}

interface FinanceTransaction {
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

const EMPTY_STATE_MESSAGE =
  "Hiện tại vẫn chưa có người nào đăng ký tài khoản hoặc thực hiện giao dịch.";

function formatDate(value: string): string {
  return new Date(value).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AdminFinancePanel() {
  const [finance, setFinance] = useState<FinanceData | null>(null);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFinance = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summary, history] = await Promise.all([
        adminApi.getFinanceSummary(),
        adminFinanceApi.getTransactions(),
      ]);
      setFinance(summary);
      setTransactions(history);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load finance data.";
      setError(message);
      toast({
        title: "Finance Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (error || !finance) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-red-400">{error || "No data"}</p>
        <button
          onClick={fetchFinance}
          className="text-sm text-blue-400 hover:text-blue-300 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const conversionRate =
    finance.totalUsers > 0
      ? ((finance.proUsers / finance.totalUsers) * 100).toFixed(1)
      : "0.0";

  const freeUsers = finance.totalUsers - finance.proUsers;
  const statusBadge = (status: FinanceTransaction["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/20 text-green-300 border border-green-500/30";
      case "FAILED":
        return "bg-red-500/20 text-red-300 border border-red-500/30";
      case "REFUNDED":
        return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
    }
  };

  const getUserName = (user: FinanceTransaction["userId"]) => {
    if (!user) return "Unknown User";
    if (typeof user === "string") return user;
    return user.username || "Unknown User";
  };

  return (
    <div className="space-y-6">
      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-emerald-700/40 bg-gradient-to-br from-emerald-950/60 to-slate-900 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-400/80">
            Monthly Revenue
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-300">
            ${finance.totalProfitUsd.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">projected / month</p>
        </Card>

        <Card className="border border-blue-700/40 bg-gradient-to-br from-blue-950/60 to-slate-900 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-400/80">
            PRO Price
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-300">
            ${finance.monthlyPriceUsd}
          </p>
          <p className="mt-1 text-xs text-slate-500">per user / month</p>
        </Card>

        <Card className="border border-purple-700/40 bg-gradient-to-br from-purple-950/60 to-slate-900 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-purple-400/80">
            PRO Users
          </p>
          <p className="mt-2 text-3xl font-bold text-purple-300">
            {finance.proUsers}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            of {finance.totalUsers} total clients
          </p>
        </Card>

        <Card className="border border-amber-700/40 bg-gradient-to-br from-amber-950/60 to-slate-900 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-400/80">
            Conversion Rate
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-300">
            {conversionRate}%
          </p>
          <p className="mt-1 text-xs text-slate-500">FREE → PRO</p>
        </Card>
      </div>

      {/* Tier Breakdown */}
      <Card className="border border-slate-700/50 bg-slate-900/60 p-5">
        <h4 className="text-sm font-semibold text-slate-300 mb-4">
          User Tier Distribution
        </h4>

        <div className="space-y-4">
          {/* Visual bar */}
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden flex">
            {finance.proUsers > 0 && (
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-700"
                style={{
                  width: `${finance.totalUsers > 0 ? (finance.proUsers / finance.totalUsers) * 100 : 0}%`,
                }}
              />
            )}
            {freeUsers > 0 && (
              <div
                className="h-full bg-gradient-to-r from-slate-600 to-slate-500 transition-all duration-700"
                style={{
                  width: `${finance.totalUsers > 0 ? (freeUsers / finance.totalUsers) * 100 : 0}%`,
                }}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-slate-400">
                PRO — {finance.proUsers} user
                {finance.proUsers !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-500" />
              <span className="text-slate-400">
                FREE — {freeUsers} user{freeUsers !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Revenue formula */}
          <div className="pt-3 border-t border-slate-800">
            <p className="text-xs text-slate-500 font-mono">
              Revenue = {finance.proUsers} PRO × ${finance.monthlyPriceUsd}
              /mo = ${finance.totalProfitUsd.toLocaleString()}/mo
            </p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border border-slate-700/50 bg-slate-900/60">
        <div className="border-b border-slate-700/50 px-5 py-4">
          <h4 className="text-sm font-semibold text-slate-200">
            Transaction History
          </h4>
          <p className="mt-1 text-xs text-slate-400">
            Latest demo payments and finance events.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">Tên người dùng</th>
                <th className="px-5 py-3">Số tiền</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Ngày thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    {EMPTY_STATE_MESSAGE}
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="border-b border-slate-800/70 last:border-b-0"
                  >
                    <td className="px-5 py-4 text-slate-100">
                      {getUserName(transaction.userId)}
                    </td>
                    <td className="px-5 py-4 text-slate-200">
                      {formatMoney(transaction.amount, transaction.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusBadge(transaction.status)}`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {formatDate(transaction.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
