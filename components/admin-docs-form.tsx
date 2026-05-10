"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { adminApi, type DocumentationDoc } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type AdminDocsFormProps = {
  docId?: string;
};

export function AdminDocsForm({ docId }: AdminDocsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = Boolean(docId);

  const [loading, setLoading] = useState(Boolean(docId));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadedDoc, setLoadedDoc] = useState<DocumentationDoc | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadDoc = async () => {
      if (!docId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const doc = await adminApi.getDocById(docId);

        if (!mounted) {
          return;
        }

        if (!doc) {
          toast({
            title: "Documentation not found",
            description: "The selected document could not be loaded.",
            variant: "destructive",
          });
          router.replace("/admin/docs");
          return;
        }

        setLoadedDoc(doc);
        setTitle(doc.title || "");
        setCategory(doc.category || "");
        setContent(doc.content || "");
        setIsPublished(Boolean(doc.isPublished));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load document";
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

    loadDoc();

    return () => {
      mounted = false;
    };
  }, [docId, router, toast]);

  const previewSummary = useMemo(() => {
    const trimmed = content.trim();
    if (!trimmed) {
      return "Preview will appear here once you start writing Markdown content.";
    }

    return trimmed;
  }, [content]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Title is required",
        description: "Enter a document title before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content is required",
        description: "Markdown content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        category: category.trim(),
        content: content.trim(),
        isPublished,
      };

      if (isEditing && docId) {
        const updated = await adminApi.updateDoc(docId, payload);
        setLoadedDoc(updated);
        toast({
          title: "Documentation updated",
          description: `${updated.title} was saved successfully.`,
        });
        return;
      }

      const created = await adminApi.createDoc(payload);
      toast({
        title: "Documentation created",
        description: `${created.title} is ready for editing.`,
      });
      router.replace(`/admin/docs/${created._id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save document";
      toast({
        title: "Save failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!docId) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this documentation article permanently?",
    );
    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      await adminApi.deleteDoc(docId);
      toast({
        title: "Documentation deleted",
        description: "The article was removed successfully.",
      });
      router.replace("/admin/docs");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete document";
      toast({
        title: "Delete failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            {isEditing ? "Edit Documentation" : "New Documentation"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage a single Markdown article with published state and category.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/docs")}>
            Back to list
          </Button>
          {!isEditing && (
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Draft form
            </Badge>
          )}
          {isEditing && loadedDoc ? (
            <Badge
              variant={loadedDoc.isPublished ? "default" : "secondary"}
              className="rounded-full px-3 py-1"
            >
              {loadedDoc.isPublished ? "Published" : "Draft"}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Title</label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="How to configure deployment checks"
              className="border-slate-700 bg-slate-950/60 text-slate-100 placeholder:text-slate-500"
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Category
              </label>
              <Input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Security, Release, Runbook"
                className="border-slate-700 bg-slate-950/60 text-slate-100 placeholder:text-slate-500"
                disabled={loading}
              />
            </div>

            <div className="flex items-end justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-200">Published</p>
                <p className="text-xs text-slate-500">
                  Visible on the public docs page.
                </p>
              </div>
              <Switch
                checked={isPublished}
                onCheckedChange={setIsPublished}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              Markdown Content
            </label>
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="# Heading\n\nWrite your documentation here..."
              className="min-h-[420px] border-slate-700 bg-slate-950/60 font-mono text-slate-100 placeholder:text-slate-500"
              disabled={loading}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-500">
              {content.length.toLocaleString()} characters
            </p>
            <div className="flex items-center gap-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading || deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              )}
              <Button type="submit" disabled={loading || saving}>
                {saving ? "Saving..." : "Save documentation"}
              </Button>
            </div>
          </div>
        </form>

        <aside className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Markdown Preview
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {title.trim() || "Untitled documentation"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {category.trim() || "Uncategorized"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-200">
              {previewSummary}
            </pre>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Slug</p>
            <p className="mt-1 break-all text-slate-400">
              {loadedDoc?.slug || "Will be generated from title"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
