"use client";

import { AdminGuard } from "@/lib/protected-route";
import { AdminShell } from "@/components/admin-shell";
import { AdminDocsForm } from "@/components/admin-docs-form";

export default function NewAdminDocPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <AdminDocsForm />
      </AdminShell>
    </AdminGuard>
  );
}
