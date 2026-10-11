"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { categoriesApi } from "@/lib/api/categories";
import { QueryKeys } from "@/constants/query-key";
import type { Category, CreateCategoryDto, UpdateCategoryDto, CategoryMenuResponse } from "@/lib/types/book";

// Hook to fetch all categories
export function useCategories() {
  return useQuery({
    queryKey: QueryKeys.categories,
    queryFn: async () => {
      const response = await categoriesApi.getCategories();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Hook to fetch single category
export function useCategory(id: string) {
  return useQuery({
    queryKey: [...QueryKeys.categories, id],
    queryFn: async () => {
      const response = await categoriesApi.getCategory(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to fetch categories menu (hierarchical structure for navbar)
export function useCategoriesMenu() {
  return useQuery({
    queryKey: QueryKeys.categoriesMenu,
    queryFn: async () => {
      const response = await categoriesApi.getCategoriesMenu();
      return response;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// Hook to create category
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateCategoryDto) => {
      const response = await categoriesApi.createCategory(dto);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.categories });
      queryClient.invalidateQueries({ queryKey: QueryKeys.categoriesMenu });
      toast.success(response.message || "Category created successfully");
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });
}

// Hook to update category
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateCategoryDto }) => {
      const response = await categoriesApi.updateCategory(id, dto);
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.categories });
      queryClient.invalidateQueries({ queryKey: [...QueryKeys.categories, variables.id] });
      queryClient.invalidateQueries({ queryKey: QueryKeys.categoriesMenu });
      toast.success(response.message || "Category updated successfully");
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });
}

// Hook to delete category
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await categoriesApi.deleteCategory(id);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.categories });
      queryClient.invalidateQueries({ queryKey: QueryKeys.categoriesMenu });
      toast.success(response.message || "Category deleted successfully");
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });
}

// Hook to toggle category hidden status (optimistic update)
export function useToggleCategoryHidden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isHidden }: { id: string; isHidden: boolean }) => {
      const response = await categoriesApi.updateCategory(id, { isHidden });
      return response;
    },
    onMutate: async ({ id, isHidden }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QueryKeys.categories });
      await queryClient.cancelQueries({ queryKey: QueryKeys.categoriesMenu });

      // Snapshot the previous value
      const previousCategories = queryClient.getQueryData(QueryKeys.categories);
      const previousMenu = queryClient.getQueryData(QueryKeys.categoriesMenu);

      // Optimistically update the categories list
      queryClient.setQueryData<Category[]>(QueryKeys.categories, (old) =>
        old?.map((cat) => (cat.id === id ? { ...cat, isHidden } : cat)) ?? []
      );

      // Optimistically update the menu
      const updateMenuHidden = (menu: CategoryMenuResponse[]): CategoryMenuResponse[] =>
        menu.map((item) => ({
          ...item,
          isHidden: item.id === id ? isHidden : item.isHidden,
          children: updateMenuHidden(item.children),
        }));

      queryClient.setQueryData<CategoryMenuResponse[]>(QueryKeys.categoriesMenu, (old) =>
        old ? updateMenuHidden(old) : []
      );

      return { previousCategories, previousMenu };
    },
    onError: (err, variables, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(QueryKeys.categories, context.previousCategories);
      }
      if (context?.previousMenu) {
        queryClient.setQueryData(QueryKeys.categoriesMenu, context.previousMenu);
      }
      toast.error("Failed to update category visibility");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.categories });
      queryClient.invalidateQueries({ queryKey: QueryKeys.categoriesMenu });
    },
  });
}

// Hook to reorder categories (bulk update displayOrder)
export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; displayOrder: number }[]) => {
      const responses = await Promise.all(
        updates.map(({ id, displayOrder }) => categoriesApi.updateCategory(id, { displayOrder }))
      );
      return responses;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.categories });
      queryClient.invalidateQueries({ queryKey: QueryKeys.categoriesMenu });
      toast.success("Categories reordered successfully");
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });
}

// Helper function to extract error message from backend response
function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
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