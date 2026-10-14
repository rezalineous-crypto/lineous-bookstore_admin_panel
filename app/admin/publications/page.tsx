"use client";

import { useState } from "react";
import { Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";

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

import { useDeletePublication } from "@/lib/hooks/use-publications";
import { PublicationsTable } from "@/components/publications/publications-table";
import { PublicationDialog } from "@/components/publications/publication-dialog";
import type { Publication } from "@/lib/types/book";

export default function PublicationsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);

  const handleEdit = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsEditDialogOpen(true);
  };

  const deleteMutation = useDeletePublication();

  const handleDelete = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPublication) {
      await deleteMutation.mutateAsync(selectedPublication.id);
    }
    setIsDeleteDialogOpen(false);
    setSelectedPublication(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Publications</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your bookstore publications.
          </p>
        </div>

        <PublicationDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Publication
            </Button>
          }
        />
      </div>

      <PublicationsTable onEdit={handleEdit} onDelete={handleDelete} />

      {/* Edit Dialog */}
      <PublicationDialog
        publication={selectedPublication}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Publication</AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              Are you sure you want to delete{" "}
              <i>
                <b>&#34;{selectedPublication?.name}</b>
              </i>
              &#34;? <br />{" "}
              <span className="font-medium">
                This will also delete all related subjects and books.
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="mt-4">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white flex items-center gap-3 cursor-pointer mt-4"
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
