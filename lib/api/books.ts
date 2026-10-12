import apiClient from "./axios";
import type {
  Book,
  UpdateBookDto,
  ApiResponse,
  Publication,
  Subject,
  BookTreePublication,
  BookPaper,
  CreateBookPaperDto,
  UpdateBookPaperDto,
  BookTreeCategory,
} from "@/lib/types/book";

// Get all books
export const getBooks = async (): Promise<ApiResponse<Book[]>> => {
  const response = await apiClient.get<ApiResponse<Book[]>>("/books");
  return response.data;
};

// Get book by ID
export const getBook = async (id: string): Promise<ApiResponse<Book>> => {
  const response = await apiClient.get<ApiResponse<Book>>(`/books/${id}`);
  return response.data;
};

// Get books in tree structure: category → publication → subject → books
export const getBooksTree = async (): Promise<ApiResponse<BookTreeCategory[]>> => {
  const response = await apiClient.get<ApiResponse<BookTreeCategory[]>>("/books/tree");
  return response.data;
};

// Create book with FormData (for file uploads)
export const createBook = async (formData: FormData): Promise<ApiResponse<Book>> => {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${apiClient.defaults.baseURL}/books`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create book");
  }
  return await response.json();
};

// Update book (supports both JSON and FormData for partial updates with file uploads)
export const updateBook = async (id: string, data: UpdateBookDto | FormData): Promise<ApiResponse<Book>> => {
  const isFormData = data instanceof FormData;
  const token = localStorage.getItem("accessToken");

  if (isFormData) {
    // Use fetch for FormData to ensure proper multipart/form-data with boundary
    const response = await fetch(`${apiClient.defaults.baseURL}/books/${id}`, {
      method: "PATCH",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: data as FormData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update book");
    }
    return await response.json();
  }

  const response = await apiClient.patch<ApiResponse<Book>>(`/books/${id}`, data);
  return response.data;
};

// Delete book (soft delete)
export const deleteBook = async (id: string): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`/books/${id}`);
  return response.data;
};

// Get all publications (for dropdown)
export const getPublications = async (): Promise<ApiResponse<Publication[]>> => {
  const response = await apiClient.get<ApiResponse<Publication[]>>("/publications");
  return response.data;
};

// Get all subjects (for dropdown)
export const getSubjects = async (): Promise<ApiResponse<Subject[]>> => {
  const response = await apiClient.get<ApiResponse<Subject[]>>("/subjects");
  return response.data;
};

// ==================== BookPaper API ====================

// Get papers for a book
export const getBookPapers = async (bookId: string): Promise<ApiResponse<BookPaper[]>> => {
  const response = await apiClient.get<ApiResponse<BookPaper[]>>(`/book-papers/book/${bookId}`);
  return response.data;
};

// Get single paper
export const getBookPaper = async (id: string): Promise<ApiResponse<BookPaper>> => {
  const response = await apiClient.get<ApiResponse<BookPaper>>(`/book-papers/${id}`);
  return response.data;
};

// Create paper (supports FormData for thumbnail upload)
export const createBookPaper = async (data: CreateBookPaperDto | FormData): Promise<ApiResponse<BookPaper>> => {
  const isFormData = data instanceof FormData;
  const token = localStorage.getItem("accessToken");

  if (isFormData) {
    const response = await fetch(`${apiClient.defaults.baseURL}/book-papers`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: data as FormData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create paper");
    }
    return await response.json();
  }

  const response = await apiClient.post<ApiResponse<BookPaper>>("/book-papers", data);
  return response.data;
};

// Update paper (supports both JSON and FormData for thumbnail uploads)
export const updateBookPaper = async (id: string, data: UpdateBookPaperDto | FormData): Promise<ApiResponse<BookPaper>> => {
  const isFormData = data instanceof FormData;
  const token = localStorage.getItem("accessToken");

  if (isFormData) {
    const response = await fetch(`${apiClient.defaults.baseURL}/book-papers/${id}`, {
      method: "PATCH",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: data as FormData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update paper");
    }
    return await response.json();
  }

  const response = await apiClient.patch<ApiResponse<BookPaper>>(`/book-papers/${id}`, data);
  return response.data;
};

// Delete paper (soft delete)
export const deleteBookPaper = async (id: string): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`/book-papers/${id}`);
  return response.data;
};

export const booksApi = {
  getBooks,
  getBook,
  getBooksTree,
  createBook,
  updateBook,
  deleteBook,
  getPublications,
  getSubjects,
  getBookPapers,
  getBookPaper,
  createBookPaper,
  updateBookPaper,
  deleteBookPaper,
};

export default booksApi;
