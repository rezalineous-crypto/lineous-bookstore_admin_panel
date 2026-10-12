"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, BookOpen, FolderOpen, Book, FolderKanban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { BookTreeCategory } from "@/lib/types/book";

interface TreeViewProps {
  data: BookTreeCategory[];
}

export function BooksTreeView({ data }: TreeViewProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedPublications, setExpandedPublications] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const togglePublication = (id: string) => {
    setExpandedPublications((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">No books found in tree structure</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((categoryTree) => (
        <Card key={categoryTree.category?.id} className="overflow-hidden">
          {/* Category Header */}
          <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => toggleCategory(categoryTree.category?.id)}
            >
              {expandedCategories.has(categoryTree?.category?.id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {categoryTree?.category?.icon && (
              <span className="text-muted-foreground text-sm font-mono">[{categoryTree.category?.icon}]</span>
            )}
            <FolderKanban className="h-5 w-5 text-emerald-600" />
            <span className="font-medium">{categoryTree.category?.name}</span>
            <Badge variant={categoryTree.category?.isHidden ? "secondary" : "default"}>
              {categoryTree.category?.isHidden ? "Hidden" : "Visible"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              ({categoryTree.publications?.length} publications)
            </span>
          </div>

          {/* Publications */}
          {expandedCategories?.has(categoryTree?.category?.id) && (
            <div className="px-4 py-2">
              {categoryTree.publications?.map((publication) => (
                <div key={publication.publication.id} className="">
                  {/* Publication Header */}
                  <div className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/20">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => togglePublication(publication.publication.id)}
                    >
                      {expandedPublications.has(publication.publication.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <FolderOpen className="h-4 w-4 text-primary" />
                    <span className="font-medium">{publication.publication.name}</span>
                    <Badge variant={publication.publication.isActive ? "default" : "secondary"} className="text-xs">
                      {publication.publication.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ({publication.subjects.length} subjects)
                    </span>
                  </div>

                  {/* Subjects and Books */}
                  {expandedPublications.has(publication.publication.id) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {publication.subjects.map((subject) => (
                        <div key={subject.subject.id} className="mt-1">
                          {/* Subject Header */}
                          <div className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/20">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleSubject(subject.subject.id)}
                            >
                              {expandedSubjects.has(subject.subject.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{subject.subject.name}</span>
                            <Badge variant={subject.subject.isActive ? "default" : "secondary"} className="text-xs">
                              {subject.subject.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              ({subject.books.length} books)
                            </span>
                          </div>

                          {/* Books List */}
                          {expandedSubjects.has(subject.subject.id) && (
                            <div className="ml-8 mt-1 space-y-1">
                              {subject.books.map((book) => (
                                <div
                                  key={book.id}
                                  className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/20"
                                >
                                  <Book className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{book.title}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {book.priceRange?.display || "-"}
                                  </span>
                                </div>
                              ))}
                              {subject.books.length === 0 && (
                                <p className="ml-6 text-sm text-muted-foreground">
                                  No books in this subject
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {publication.subjects.length === 0 && (
                        <p className="ml-6 text-sm text-muted-foreground">
                          No subjects in this publication
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {categoryTree.publications?.length === 0 && (
                <p className="ml-6 text-sm text-muted-foreground">
                  No publications in this category
                </p>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
