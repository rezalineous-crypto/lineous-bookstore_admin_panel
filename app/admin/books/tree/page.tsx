"use client";

import { useRouter } from "next/navigation";
import { TreePine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BooksTreeView } from "@/components/books/books-tree-view";
import { useBooksTree } from "@/lib/hooks/use-books";

export default function BooksTreePage() {
  const router = useRouter();
  const { data: treeData, isLoading, error } = useBooksTree();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Books Tree</h1>
          <p className="mt-2 text-muted-foreground">
            Browse books organized by category, publication, and subject.
          </p>
        </div>

        <Button
          className="gap-2"
          onClick={() => router.push("/admin/books")}
        >
          <TreePine className="h-4 w-4" />
          Back to Books List
        </Button>
      </div>

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Failed to load tree data"}
          </p>
        </div>
      )}

      {!isLoading && !error && <BooksTreeView data={treeData || []} />}
    </div>
  );
}
