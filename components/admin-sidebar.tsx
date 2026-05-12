"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";

const navItems: Array<{ href: string; label: string }> = [
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/docs", label: "Documentation" },
  { href: "/admin/users", label: "User Management" },
  { href: "/admin/finance", label: "Finance" },
  { href: "/admin/history", label: "Global History" },
  { href: "/admin", label: "Knowledge Sync" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0">
      <div className="border-b border-slate-800 p-5">
        <BrandLogo
          size="sm"
          title="Loggers Admin"
          subtitle="Isolated Admin Workspace"
        />
      </div>

      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
