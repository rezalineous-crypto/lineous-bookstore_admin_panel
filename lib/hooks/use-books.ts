"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { booksApi } from "@/lib/api/books";
import { QueryKeys } from "@/constants/query-key";
import type {
  UpdateBookDto,
  BookTreePublication,
  BookPaper,
  CreateBookPaperDto,
  UpdateBookPaperDto,
} from "@/lib/types/book";

// Hook to fetch all books
export function useBooks() {
  return useQuery({
    queryKey: QueryKeys.books,
    queryFn: async () => {
      const response = await booksApi.getBooks();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Hook to fetch single book
export function useBook(id: string) {
  return useQuery({
    queryKey: [...QueryKeys.books, id],
    queryFn: async () => {
      const response = await booksApi.getBook(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to fetch books tree structure
export function useBooksTree() {
  return useQuery({
    queryKey: QueryKeys.booksTree,
    queryFn: async () => {
      const response = await booksApi.getBooksTree();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Hook to create book
export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await booksApi.createBook(formData);
      console.log(response);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.books });
      toast.success(response.message || "Book created successfully");
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });
}

// Hook to update book (supports both JSON and FormData for partial updates with file uploads)
export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBookDto | FormData }) => {
      const response = await booksApi.updateBook(id, data);
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.books });
      queryClient.invalidateQueries({ queryKey: [...QueryKeys.books, variables.id] });
      toast.success(response.message || "Book updated successfully");
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });
}

// Hook to delete book
export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await booksApi.deleteBook(id);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.books });
      toast.success(response.message || "Book deleted successfully");
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });
}

// ==================== BookPaper Hooks ====================

// Hook to fetch papers for a book
export function useBookPapers(bookId: string) {
  return useQuery({
    queryKey: QueryKeys.bookPapersByBook(bookId),
    queryFn: async () => {
      const response = await booksApi.getBookPapers(bookId);
      return response.data;
    },
    enabled: !!bookId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to create paper (supports FormData for thumbnail upload)
export function useCreateBookPaper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBookPaperDto | FormData) => {
      const response = await booksApi.createBookPaper(data);
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.bookPapersByBook((variables as CreateBookPaperDto).bookId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.books });
      toast.success(response.message || "Paper created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Hook to update paper (supports both JSON and FormData for thumbnail uploads)
export function useUpdateBookPaper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBookPaperDto | FormData }) => {
      const response = await booksApi.updateBookPaper(id, data);
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.books });
      queryClient.invalidateQueries({ queryKey: QueryKeys.bookPapers });
      toast.success(response.message || "Paper updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Hook to delete paper
export function useDeleteBookPaper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await booksApi.deleteBookPaper(id);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.books });
      queryClient.invalidateQueries({ queryKey: QueryKeys.bookPapers });
      toast.success(response.message || "Paper deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Helper function to extract error message from backend response
function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    console.log(message);
    if (Array.isArray(message)) {
      return message.join(", ");
    }
    if (typeof message === "string") {
      return message;
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

// Hook to fetch publications
export function usePublications() {
  return useQuery({
    queryKey: QueryKeys.publications,
    queryFn: async () => {
      const response = await booksApi.getPublications();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - publications don't change often
  });
}

// Hook to fetch subjects
export function useSubjects() {
  return useQuery({
    queryKey: QueryKeys.subjects,
    queryFn: async () => {
      const response = await booksApi.getSubjects();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - subjects don't change often
  });
}
