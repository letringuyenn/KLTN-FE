"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { AuthGuard } from "@/lib/protected-route";
import { Spinner } from "@/components/ui/spinner";
import {
  documentationApi,
  type DocumentationDoc,
} from "@/lib/api-client";

export default function DocumentationPage() {
  const [docs, setDocs] = useState<DocumentationDoc[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadDocs = async () => {
      try {
        setIsLoading(true);
        setError("");

        const docsPayload = await documentationApi.getPublishedDocs();
        setDocs(docsPayload);

        if (docsPayload.length > 0) {
          setActiveSlug(docsPayload[0].slug);
        }
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load documentation";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocs();
  }, []);

  const activeDoc = useMemo(
    () => docs.find((item) => item.slug === activeSlug) || null,
    [docs, activeSlug],
  );

  const renderMarkdown = (content: string) =>
    content.split(/\n{2,}/).map((block, index) => {
      const trimmed = block.trim();
      if (!trimmed) {
        return null;
      }

      if (trimmed.startsWith("# ")) {
        return (
          <h3
            key={index}
            className="mt-6 text-xl font-semibold text-white first:mt-0"
          >
            {trimmed.replace(/^#\s+/, "")}
          </h3>
        );
      }

      if (trimmed.startsWith("## ")) {
        return (
          <h4
            key={index}
            className="mt-5 text-lg font-semibold text-slate-100 first:mt-0"
          >
            {trimmed.replace(/^##\s+/, "")}
          </h4>
        );
      }

      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <ul
            key={index}
            className="mt-4 list-disc space-y-2 pl-5 text-slate-300"
          >
            {trimmed.split(/\n/).map((line, lineIndex) => (
              <li key={lineIndex}>{line.replace(/^[-*]\s+/, "")}</li>
            ))}
          </ul>
        );
      }

      return (
        <p
          key={index}
          className="mt-4 whitespace-pre-wrap text-slate-300 leading-7 first:mt-0"
        >
          {trimmed}
        </p>
      );
    });

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <div className="flex">
          <DashboardSidebar />

          <main className="min-w-0 flex-1 overflow-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
              <div className="mb-6 rounded-2xl border border-blue-500/20 bg-card/60 p-5 shadow-lg backdrop-blur sm:mb-8 sm:p-7">
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                  Documentation
                </h2>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  Knowledge base is loaded dynamically from MongoDB.
                </p>
              </div>

              {isLoading ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-border bg-card/50">
                  <Spinner />
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  {error}
                </div>
              ) : docs.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card/50 p-5 text-sm text-muted-foreground">
                  No documentation articles found.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-[250px_minmax(0,1fr)]">
                  <aside className="rounded-2xl border border-border bg-card/50 p-3">
                    <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Table of Contents
                    </p>

                    <div className="space-y-1 md:max-h-[calc(100vh-220px)] md:overflow-y-auto md:pr-1">
                      {docs.map((doc) => {
                        const isActive = activeSlug === doc.slug;

                        return (
                          <button
                            key={doc.slug}
                            type="button"
                            onClick={() => setActiveSlug(doc.slug)}
                            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                              isActive
                                ? "bg-blue-500/15 text-blue-100 ring-1 ring-blue-500/30"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                          >
                            <span className="min-w-0 truncate font-medium">
                              {doc.title}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 shrink-0 transition-transform ${
                                isActive
                                  ? "rotate-180 text-blue-200"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </aside>

                  <section className="space-y-3 rounded-2xl border border-border bg-card/50 p-4 sm:p-6">
                    {docs.map((doc) => {
                      const isOpen = doc.slug === activeSlug;

                      return (
                        <details
                          key={doc.slug}
                          open={isOpen}
                          className="group rounded-xl border border-border bg-background/40 px-4 py-3 transition"
                          onClick={(event) => {
                            event.preventDefault();
                            setActiveSlug(isOpen ? "" : doc.slug);
                          }}
                        >
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                            <div>
                              <p className="text-base font-semibold text-foreground">
                                {doc.title}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                                {doc.category || "Uncategorized"}
                              </p>
                            </div>

                            <ChevronDown
                              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                            />
                          </summary>

                          <div className="pt-4">
                            <div className="rounded-xl border border-border bg-card/60 p-4 sm:p-5">
                              <div className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
                                {renderMarkdown(doc.content)}
                              </div>
                            </div>
                          </div>
                        </details>
                      );
                    })}
                  </section>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
