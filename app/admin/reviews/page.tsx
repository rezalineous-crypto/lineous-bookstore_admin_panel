"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { ReviewsTable } from "@/components/reviews/reviews-table";
import { ReviewDialog } from "@/components/reviews/review-dialog";
import { useBooks } from "@/lib/hooks/use-books";
import { useDeleteReview } from "@/lib/hooks/use-reviews";
import type { Review } from "@/lib/types/book";

export default function ReviewsPage() {
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const { data: booksData } = useBooks();
  const books = booksData?.data ?? [];
  const deleteMutation = useDeleteReview();

  const handleEdit = (review: Review) => {
    setSelectedReview(review);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (review: Review) => {
    setSelectedReview(review);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedReview) {
      await deleteMutation.mutateAsync(selectedReview.id);
    }
    setIsDeleteDialogOpen(false);
    setSelectedReview(null);
  };

  const selectedBook = books.find((b) => b.id === selectedBookId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="mt-2 text-muted-foreground">
            Manage book reviews and testimonials.
          </p>
        </div>

        <ReviewDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          bookId={selectedBookId}
          trigger={
            <Button className="gap-2" disabled={!selectedBookId}>
              <Plus className="h-4 w-4" />
              Add Review
            </Button>
          }
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="w-full max-w-md">
          <SearchableDropdown
            items={books.map((book) => ({ id: book.id, label: book.title }))}
            value={selectedBookId}
            onChange={(item) => {
              if (item) setSelectedBookId(item.id as string);
            }}
            placeholder="Select a book to manage reviews"
            buttonClassName="w-full h-10"
            loading={!books || books.length === 0}
          />
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            className="h-10 rounded-md border-border/60 bg-popover pl-10 pr-4"
          />
        </div>
      </div>

      {selectedBookId ? (
        <>
          <p className="text-sm text-muted-foreground">
            Managing reviews for: <span className="font-medium">{selectedBook?.title || "Unknown Book"}</span>
          </p>
          <ReviewsTable
            bookId={selectedBookId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      ) : (
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Please select a book to view its reviews</p>
        </div>
      )}

      {/* Edit Dialog */}
      <ReviewDialog
        review={selectedReview}
        bookId={selectedBookId}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the review by &#34;{selectedReview?.reviewerName}&#34;? This action will soft delete the review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
