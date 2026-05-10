"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/lib/protected-route";
import { AdminShell } from "@/components/admin-shell";
import { useToast } from "@/hooks/use-toast";
import { adminApi, type DocumentationDoc } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function AdminDocsListContent() {
  const { toast } = useToast();
  const [docs, setDocs] = useState<DocumentationDoc[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDocs = async () => {
      try {
        setLoading(true);
        const payload = await adminApi.getDocs(page, 10);
        if (!mounted) {
          return;
        }
        setDocs(payload.docs || []);
        setPages(payload.pagination?.pages || 1);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load documents";
        toast({
          title: "Load failed",
          description: message,
          variant: "destructive",
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDocs();

    return () => {
      mounted = false;
    };
  }, [page, toast]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this documentation article permanently?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      await adminApi.deleteDoc(id);
      toast({
        title: "Documentation deleted",
        description: "The article was removed successfully.",
      });
      setDocs((current) => current.filter((doc) => doc._id !== id));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete document";
      toast({
        title: "Delete failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminShell>
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Documentation CMS
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage single-schema Markdown articles for the admin knowledge
              base.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/docs/new">New documentation</Link>
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800/80 hover:bg-transparent">
                <TableHead className="text-slate-300">Title</TableHead>
                <TableHead className="text-slate-300">Slug</TableHead>
                <TableHead className="text-slate-300">Category</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Updated</TableHead>
                <TableHead className="text-right text-slate-300">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow className="border-slate-800/60">
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-slate-400"
                  >
                    Loading documentation...
                  </TableCell>
                </TableRow>
              )}

              {!loading && docs.length === 0 && (
                <TableRow className="border-slate-800/60">
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-slate-400"
                  >
                    No documentation found. Create the first article to get
                    started.
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                docs.map((doc) => (
                  <TableRow
                    key={doc._id}
                    className="border-slate-800/60 hover:bg-slate-950/40"
                  >
                    <TableCell className="font-medium text-white">
                      {doc.title}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-slate-400">
                      {doc.slug}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {doc.category || "Uncategorized"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={doc.isPublished ? "default" : "secondary"}
                        className="rounded-full px-2.5 py-1"
                      >
                        {doc.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {Number.isNaN(new Date(doc.updatedAt).getTime())
                        ? new Date(doc.createdAt).toLocaleString()
                        : new Date(doc.updatedAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/docs/${doc._id}`}>Edit</Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(doc._id)}
                          disabled={deletingId === doc._id}
                        >
                          {deletingId === doc._id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
          <p>
            Page {page} of {pages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.min(pages, current + 1))}
              disabled={page >= pages}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

export default function AdminDocsPage() {
  return (
    <AdminGuard>
      <AdminDocsListContent />
    </AdminGuard>
  );
}
