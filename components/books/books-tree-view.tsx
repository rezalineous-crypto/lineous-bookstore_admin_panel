"use client";

import { useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  BookText,
  Folder,
  Library,
  Eye,
  EyeOff,
  CircleCheck,
  CircleX,
  Layers3,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { BookTreeCategory } from "@/lib/types/book";

interface TreeViewProps {
  data: BookTreeCategory[];
}

interface TreeRowProps {
  title: string;
  icon: ReactNode;
  count?: number;
  countLabel?: string;
  status?: {
    label: string;
    active: boolean;
  };
  expanded?: boolean;
  expandable?: boolean;
  onToggle?: () => void;
  level?: "publication" | "subject";
}

function TreeRow({
  title,
  icon,
  count,
  countLabel,
  status,
  expanded = false,
  expandable = true,
  onToggle,
  level = "publication",
}: TreeRowProps) {
  const isPublication = level === "publication";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!expandable}
      aria-expanded={expandable ? expanded : undefined}
      className={[
        "group flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-3",
        "text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isPublication ? "hover:bg-muted/70" : "hover:bg-muted/50",
        !expandable ? "cursor-default" : "cursor-pointer",
      ].join(" ")}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border/70 transition-colors group-hover:text-foreground">
        {expandable ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform duration-200" />
          )
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
        )}
      </span>

      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {title}
        </span>

        {count !== undefined && (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {count} {countLabel}
          </span>
        )}
      </span>

      {status && (
        <Badge
          variant="outline"
          className={[
            "hidden shrink-0 items-center gap-1.5 border px-2 py-0.5 font-normal sm:inline-flex",
            status.active
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-border bg-muted/60 text-muted-foreground",
          ].join(" ")}
        >
          {status.active ? (
            <CircleCheck className="h-3 w-3" />
          ) : (
            <CircleX className="h-3 w-3" />
          )}
          {status.label}
        </Badge>
      )}

      {count !== undefined && (
        <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs tabular-nums text-muted-foreground sm:hidden">
          {count}
        </span>
      )}
    </button>
  );
}

function ExpandableContent({
  expanded,
  children,
}: {
  expanded: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={[
        "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
        expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      ].join(" ")}
      aria-hidden={!expanded}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

export function BooksTreeView({ data }: TreeViewProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const [expandedPublications, setExpandedPublications] = useState<Set<string>>(
    new Set()
  );

  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set()
  );

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    id: string
  ) => {
    setter((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  if (!data?.length) {
    return (
      <Card className="flex min-h-72 flex-col items-center justify-center border-dashed p-8 text-center shadow-none">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Library className="h-7 w-7 text-muted-foreground" />
        </span>

        <h3 className="text-base font-semibold">No books found</h3>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Your book catalog is empty, or there are no books available in this
          tree structure.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {data.map((categoryTree, categoryIndex) => {
        const category = categoryTree.category;
        const categoryId =
          category?.id ?? category?.slug ?? `category-${categoryIndex}`;

        const publications = categoryTree.publications ?? [];
        const categoryExpanded = expandedCategories.has(categoryId);

        const totalSubjects = publications.reduce(
          (total, publication) => total + publication.subjects.length,
          0
        );

        const totalBooks = publications.reduce(
          (total, publication) =>
            total +
            publication.subjects.reduce(
              (subjectTotal, subject) => subjectTotal + subject.books.length,
              0
            ),
          0
        );

        return (
          <Card
            key={categoryId}
            className="overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md"
          >
            {/* Category header */}
            <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/30 to-transparent">
              <div className="absolute inset-y-0 left-0 w-1 bg-primary/70" />

              <div className="flex items-start gap-3 px-4 py-5 sm:items-center sm:px-5">
                <button
                  type="button"
                  onClick={() => toggle(setExpandedCategories, categoryId)}
                  aria-expanded={categoryExpanded}
                  aria-label={`${categoryExpanded ? "Collapse" : "Expand"} ${
                    category?.name ?? "category"
                  }`}
                  className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/80 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:mt-0"
                >
                  {categoryExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
                  <Folder className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                      {category?.name ?? "Unnamed category"}
                    </h3>

                    <Badge
                      variant="outline"
                      className={
                        category?.isHidden
                          ? "gap-1 border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : "gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      }
                    >
                      {category?.isHidden ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                      {category?.isHidden ? "Hidden" : "Visible"}
                    </Badge>
                  </div>

                  <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">
                    {/* {category?.slug ?? "No category slug"} */}
                    {category?.route ? ` · ${category.route}` : ""}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Library className="h-3.5 w-3.5" />
                      {publications.length} publications
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Layers3 className="h-3.5 w-3.5" />
                      {totalSubjects} subjects
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      {totalBooks} books
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Publications */}
            <ExpandableContent expanded={categoryExpanded}>
              <div className="space-y-1 p-3 sm:p-4">
                {publications.map((publicationTree, publicationIndex) => {
                  const publication = publicationTree.publication;

                  const publicationId =
                    publication.id ??
                    `${categoryId}-publication-${publicationIndex}`;

                  const publicationExpanded =
                    expandedPublications.has(publicationId);

                  const subjects = publicationTree.subjects ?? [];

                  return (
                    <div
                      key={publicationId}
                      className="overflow-hidden rounded-xl border border-transparent transition-colors hover:border-border/60"
                    >
                      <TreeRow
                        title={publication.name}
                        icon={<Library className="h-4 w-4" />}
                        count={subjects.length}
                        countLabel="subjects"
                        status={{
                          label: publication.isActive ? "Active" : "Inactive",
                          active: publication.isActive,
                        }}
                        expanded={publicationExpanded}
                        expandable={subjects.length > 0}
                        onToggle={() =>
                          toggle(setExpandedPublications, publicationId)
                        }
                        level="publication"
                      />

                      <ExpandableContent expanded={publicationExpanded}>
                        <div className="relative ml-5 space-y-1 border-l border-border/70 pb-2 pl-3 sm:ml-7 sm:pl-4">
                          {subjects.map((subjectTree, subjectIndex) => {
                            const subject = subjectTree.subject;

                            const subjectId =
                              subject.id ??
                              `${publicationId}-subject-${subjectIndex}`;

                            const subjectExpanded =
                              expandedSubjects.has(subjectId);

                            const books = subjectTree.books ?? [];

                            return (
                              <div key={subjectId} className="relative">
                                <div className="absolute -left-3 top-7 h-px w-3 bg-border/70 sm:-left-4 sm:w-4" />

                                <TreeRow
                                  title={subject.name}
                                  icon={<BookOpen className="h-4 w-4" />}
                                  count={books.length}
                                  countLabel="books"
                                  status={{
                                    label: subject.isActive
                                      ? "Active"
                                      : "Inactive",
                                    active: subject.isActive,
                                  }}
                                  expanded={subjectExpanded}
                                  expandable={books.length > 0}
                                  onToggle={() =>
                                    toggle(setExpandedSubjects, subjectId)
                                  }
                                  level="subject"
                                />

                                {/* Books */}
                                <ExpandableContent expanded={subjectExpanded}>
                                  <div className="relative ml-5 space-y-2 border-l border-border/70 py-2 pl-3 sm:ml-7 sm:pl-4">
                                    {books.map((book) => (
                                      <div
                                        key={book.id}
                                        className="relative flex min-w-0 items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-2.5 transition-colors hover:border-border hover:bg-muted/50 sm:p-3"
                                      >
                                        <div className="absolute -left-3 top-1/2 h-px w-3 bg-border/70 sm:-left-4 sm:w-4" />

                                        <div className="flex h-12 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/70 bg-background sm:h-14 sm:w-11">
                                          {book.thumbnail ? (
                                            <img
                                              src={book.thumbnail}
                                              alt=""
                                              loading="lazy"
                                              className="h-full w-full object-cover"
                                            />
                                          ) : (
                                            <BookText className="h-5 w-5 text-muted-foreground" />
                                          )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                          <p className="line-clamp-2 text-sm font-medium leading-5 text-foreground">
                                            {book.title}
                                          </p>

                                          <p className="mt-1 truncate text-xs text-muted-foreground">
                                            {book.slug ?? "No slug"}
                                          </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-background px-2.5 py-2 text-sm font-semibold tabular-nums">
                                          <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                                          {book.priceRange?.display || "—"}
                                        </div>
                                      </div>
                                    ))}

                                    {books.length === 0 && (
                                      <p className="rounded-lg bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
                                        No books in this subject.
                                      </p>
                                    )}
                                  </div>
                                </ExpandableContent>
                              </div>
                            );
                          })}

                          {subjects.length === 0 && (
                            <p className="px-3 py-4 text-sm text-muted-foreground">
                              No subjects in this publication.
                            </p>
                          )}
                        </div>
                      </ExpandableContent>
                    </div>
                  );
                })}

                {publications.length === 0 && (
                  <p className="rounded-xl bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    No publications in this category.
                  </p>
                )}
              </div>
            </ExpandableContent>
          </Card>
        );
      })}
    </div>
  );
}
