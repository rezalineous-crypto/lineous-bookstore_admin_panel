import apiClient from "./axios";
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  ApiResponse,
  CategoryMenuResponse,
} from "@/lib/types/book";

// Get all categories
export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
  const response = await apiClient.get<ApiResponse<Category[]>>("/categories");
  return response.data;
};

// Get category by ID
export const getCategory = async (id: string): Promise<ApiResponse<Category>> => {
  const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
  return response.data;
};

// Create category
export const createCategory = async (dto: CreateCategoryDto): Promise<ApiResponse<Category>> => {
  const response = await apiClient.post<ApiResponse<Category>>("/categories", dto);
  return response.data;
};

// Update category
export const updateCategory = async (id: string, dto: UpdateCategoryDto): Promise<ApiResponse<Category>> => {
  const response = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, dto);
  return response.data;
};

// Delete category
export const deleteCategory = async (id: string): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`/categories/${id}`);
  return response.data;
};

// Get categories menu (hierarchical structure for navbar)
export const getCategoriesMenu = async (): Promise<ApiResponse<CategoryMenuResponse[]>> => {
  const response = await apiClient.get<ApiResponse<CategoryMenuResponse[]>>("/categories/menu");
  return response.data;
};

export const categoriesApi = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesMenu,
};

export default categoriesApi;