"use client";

import { use } from "react";
import { AdminGuard } from "@/lib/protected-route";
import { AdminShell } from "@/components/admin-shell";
import { AdminDocsForm } from "@/components/admin-docs-form";

export default function EditAdminDocPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <AdminGuard>
      <AdminShell>
        <AdminDocsForm docId={resolvedParams.id} />
      </AdminShell>
    </AdminGuard>
  );
}
