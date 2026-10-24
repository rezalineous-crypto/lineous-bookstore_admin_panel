"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { StatusBadge } from "./status-badge";
import { BookActions } from "./book.actions";
import { useBooks } from "@/lib/hooks/use-books";
import type { Book } from "@/lib/types/book";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZES = [20, 50, 100];

interface BooksTableProps {
  onView?: (book: Book) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onAddPaper?: (book: Book) => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export function BooksTable({
  onView,
  onEdit,
  onDelete,
  onAddPaper,
  onSearch,
  searchQuery = "",
}: BooksTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, error } = useBooks({
    page,
    limit,
    q: searchQuery,
  });
  const books = data?.data;
  const meta = data?.meta;

  const handleDelete = (book: Book) => {
    onDelete?.(book);
  };

  const handleAddPaper = (book: Book) => {
    if (onAddPaper) {
      onAddPaper(book);
    } else {
      router.push(`/admin/books/${book.id}`);
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (!meta) return;
    const clamped = Math.min(Math.max(1, nextPage), meta.pages || 1);
    setPage(clamped);
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load books";
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">{errorMessage}</p>
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">No books found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
        <table className="w-full">
          <thead className="bg-gray-100 font-bold">
            <tr className="border-b border-border/60 bg-muted/30 text-left text-sm">
              <th className="px-6 py-4 font-semibold text-gray-500">Book</th>
              <th className="px-6 py-4 font-semibold text-gray-500">Publication</th>
              <th className="px-6 py-4 font-semibold text-gray-500">Subject</th>
              <th className="px-6 py-4 font-semibold text-gray-500">Categories</th>
              <th className="px-6 py-4 font-semibold text-gray-500">Price Range</th>
              <th className="px-6 py-4 font-semibold text-gray-500">Papers</th>
              <th className="px-6 py-4 font-semibold text-gray-500">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-500">Actions</th>
              <th className="px-6 py-4 font-semibold text-gray-500"></th>
            </tr>
          </thead>

          <tbody>
            {books.map((book) => (
              <tr
                key={book.id}
                className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/20"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-10 items-center justify-center rounded-lg bg-muted/50">
                      {book.thumbnail ? (
                        <Image
                          src={book?.thumbnail || ""}
                          alt={book.title}
                          width={40}
                          height={56}
                          className="rounded-md object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="text-xs text-muted-foreground">No Image</div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium font-sans">{book.title}</h4>
                      <p className="text-sm text-muted-foreground">{book.slug}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {book.publication?.name || book.publicationId || "-"}
                </td>

                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {book.subject?.name || book.subjectId || "-"}
                </td>

                <td className="px-6 py-4 text-sm">
                  {book.categories && book.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {book.categories.map((category) => (
                        <span
                          key={category.id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>

                <td className="px-6 py-4 text-sm font-medium">
                  {book.priceRange?.display || "-"}
                </td>

                <td className="px-6 py-4 text-sm">
                  {book.papers?.length ?? 0}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={book.status} />
                </td>

                <td className="px-6 py-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => handleAddPaper(book)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Paper
                  </Button>
                </td>

                <td className="px-6 py-4">
                  <BookActions
                    onView={() => onView?.(book)}
                    onEdit={() => onEdit?.(book)}
                    onDelete={() => handleDelete(book)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select
              value={String(limit)}
              onValueChange={(v) => handleLimitChange(Number(v))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(page - 1)}
                  aria-disabled={page <= 1}
                  className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>

              {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === page}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(page + 1)}
                  aria-disabled={page >= meta.pages}
                  className={page >= meta.pages ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.total)} of {meta.total}
          </div>
        </div>
      )}
    </div>
  );
}
