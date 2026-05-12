"use client";

import { AdminGuard } from "@/lib/protected-route";
import { AdminShell } from "@/components/admin-shell";
import { AdminFeedbackPanel } from "@/components/admin-feedback-panel";

function AdminFeedbackPageContent() {
  return (
    <AdminShell>
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Feedback Management
          </h2>
          <p className="text-sm text-slate-400">
            Review user feedback and reply from the admin workspace.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <AdminFeedbackPanel />
        </div>
      </section>
    </AdminShell>
  );
}

export default function AdminFeedbackPage() {
  return (
    <AdminGuard>
      <AdminFeedbackPageContent />
    </AdminGuard>
  );
}
