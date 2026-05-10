"use client";

import { AdminGuard } from "@/lib/protected-route";
import { AdminShell } from "@/components/admin-shell";
import { AdminFinancePanel } from "@/components/admin-finance-panel";

function AdminFinancePageContent() {
  return (
    <AdminShell>
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Finance Dashboard
          </h2>
          <p className="text-sm text-slate-400">
            Revenue snapshot based on current PRO subscriptions and transaction
            history.
          </p>
        </div>

        <AdminFinancePanel />
      </section>
    </AdminShell>
  );
}

export default function AdminFinancePage() {
  return (
    <AdminGuard>
      <AdminFinancePageContent />
    </AdminGuard>
  );
}
