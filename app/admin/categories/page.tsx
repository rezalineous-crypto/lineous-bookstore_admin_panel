"use client";

import { useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CategoriesTable } from "@/components/categories/categories-table";
import { CategoryDialog } from "@/components/categories/category-dialog";
import { MenuPreview } from "@/components/categories/menu-preview";
import { useDeleteCategory } from "@/lib/hooks/use-categories";
import type { Category } from "@/lib/types/book";

export default function CategoriesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const deleteMutation = useDeleteCategory();

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCategory) {
      await deleteMutation.mutateAsync(selectedCategory.id);
    }
    setIsDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="mt-2 text-muted-foreground">
            Manage navigation categories for the customer menu.
          </p>
        </div>

        <CategoryDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Categories Table - 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            {/* <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Categories</CardTitle>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </CardHeader> */}
            <CardContent className="p-0">
              <CategoriesTable
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>

          <CategoryDialog
            category={selectedCategory}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={() => {
              setSelectedCategory(null);
            }}
          />
        </div>

        {/* Menu Preview - 1 column */}
        <div className="lg:col-span-1">
          <Card className="h-full sticky top-24">
            <CardContent className="p-6 h-full">
              <MenuPreview />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCategory?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white flex items-center gap-3 cursor-pointer"
            >
              <Trash2 />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}