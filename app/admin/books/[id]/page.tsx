"use client";

import { use } from "react";
import { useState } from "react";
import {
  ArrowLeft,
  Star,
  BookOpen,
  Tag,
  Hash,
  Calendar,
  FileText,
  Users,
  Clock,
  Edit3,
  FolderTree,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReviewDialog } from "@/components/reviews/review-dialog";
import { BookDialog } from "@/components/books/book-dialog";
import { useBook } from "@/lib/hooks/use-books";
import { useReviews } from "@/lib/hooks/use-reviews";
import { useRouter } from "next/navigation";
import type { Review } from "@/lib/types/book";
import { StatusBadge } from "@/components/books/status-badge";
import { BookPapersManager } from "@/components/books/book-papers-manager";

interface BookDetailPageProps {
  params: Promise<{ id: string }>;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating}/5</span>
    </div>
  );
}

export default function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { data: book, isLoading, error } = useBook(id);
  const { data: reviews } = useReviews(id);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-destructive">Book not found</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const averageRating = reviews?.length
    ? reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) /
      reviews.length
    : 0;

  return (
    <div className="min-h-screen space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/books")}
          className="h-auto p-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Books
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{book.title}</span>
      </nav>

      {/* Hero Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Book Cover */}
        <div className="lg:col-span-4">
          <Card className="overflow-hidden border-0 shadow-lg">
            <CardContent className="p-0">
              <div className="relative aspect-[2/3] w-full bg-gradient-to-br from-muted/50 to-muted/30">
                {book.thumbnail ? (
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookOpen className="h-24 w-24 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
                    {book.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Book Details */}
        <div className="lg:col-span-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <StatusBadge status={book.status} />
                {book.papers && book.papers.length > 0 && (
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                    {book.papers.length} Paper{book.papers.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                {book.title}
              </h1>
              {book.shortDescription && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {book.shortDescription}
                </p>
              )}
            </div>

            {/* Price & Rating */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Price Range</p>
                <p className="text-3xl font-bold text-foreground">
                  {book.priceRange?.display || "No papers"}
                </p>
              </div>
              {reviews && reviews.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-2">
                    <StarRating rating={Math.round(averageRating)} />
                    <span className="text-sm text-muted-foreground">
                      ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {book.publication && (
                <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Publication</p>
                    <p className="font-semibold text-foreground">{book.publication.name}</p>
                  </div>
                </div>
              )}

              {book.subject && (
                <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Tag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Subject</p>
                    <p className="font-semibold text-foreground">{book.subject.name}</p>
                  </div>
                </div>
              )}

              {book.categories && book.categories.length > 0 && (
                <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FolderTree className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Categories</p>
                    <div className="flex flex-wrap gap-1">
                      {book.categories.map((category) => (
                        <Badge key={category.id} variant="secondary" className="bg-primary/10 text-primary">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {book.edition && (
                <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Edition</p>
                    <p className="font-semibold text-foreground">{book.edition}</p>
                  </div>
                </div>
              )}

              {book.language && (
                <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Hash className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Language</p>
                    <p className="font-semibold text-foreground">{book.language}</p>
                  </div>
                </div>
              )}

              {book.publicationDate && (
                <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Published</p>
                    <p className="font-semibold text-foreground">
                      {new Date(book.publicationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <BookDialog
                book={book}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSuccess={() => {
                  // The useUpdateBook hook already invalidates queries on success
                }}
                trigger={
                  <Button className="gap-2" variant="default">
                    <Edit3 className="h-4 w-4" />
                    Edit Book
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Description</h2>
            <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
              {book.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Papers Management Section */}
      <div>
        <BookPapersManager bookId={book.id} bookTitle={book.title} />
      </div>

      {/* Reviews Section */}
      <div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Customer Reviews</h2>
                <p className="text-sm text-muted-foreground">
                  {reviews?.length || 0} review{(reviews?.length || 0) !== 1 ? "s" : ""}
                </p>
              </div>
              <ReviewDialog
                bookId={book.id}
                trigger={
                  <Button size="sm" className="gap-2">
                    <Star className="h-4 w-4" />
                    Write a Review
                  </Button>
                }
              />
            </div>

            {reviews && reviews.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {reviews.map((review: Review) => (
                  <Card key={review.id} className="border-border/60">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {review.reviewerName}
                            </h4>
                            {review.designation && (
                              <p className="text-sm text-muted-foreground">
                                {review.designation}
                              </p>
                            )}
                          </div>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      {review.comment && (
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Star className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-lg font-medium text-foreground">No reviews yet</p>
                <p className="text-sm text-muted-foreground">
                  Be the first to review this book!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
