"use client";

import { useSubjects, useUpdateSubject } from "@/lib/hooks/use-subjects";
import type { Subject } from "@/lib/types/book";
import { SubjectActions } from "./subject.actions";
import { toast } from "sonner";

interface SubjectsTableProps {
  onEdit?: (subject: Subject) => void;
  onDelete?: (subject: Subject) => void;
}

export function SubjectsTable({ onEdit, onDelete }: SubjectsTableProps) {
  const { data: subjects, isLoading, error } = useSubjects();
  const updateMutation = useUpdateSubject();

  const handleDelete = (subject: Subject) => {
    onDelete?.(subject);
  };

  const handleToggleActive = async (subject: Subject) => {
    try {
      await updateMutation.mutateAsync({
        id: subject.id,
        data: { isActive: !subject.isActive },
      });
      toast.success(
        `Subject ${subject.isActive ? "deactivated" : "activated"} successfully`
      );
    } catch {
      // Error handled by mutation
    }
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
      error instanceof Error ? error.message : "Failed to load subjects";
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">{errorMessage}</p>
      </div>
    );
  }

  if (!subjects || subjects.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">No subjects found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
      <table className="w-full">
       <thead className="bg-gray-100 font-bold">
          <tr className="border-b border-border/60 bg-muted/30 text-left text-sm">
             <th className="px-6 py-4 font-semibold text-gray-500">
              Subject
            </th>
             <th className="px-6 py-4 font-semibold text-gray-500">
              Slug
            </th>
             {/* <th className="px-6 py-4 font-semibold text-gray-500">
              Publication
            </th>
             <th className="px-6 py-4 font-semibold text-gray-500">
              Description
            </th> */}
             <th className="px-6 py-4 font-semibold text-gray-500">
              Active
            </th>
             <th className="px-6 py-4 font-semibold text-gray-500">
              Created At
            </th>
             <th className="px-6 py-4 font-semibold text-gray-500">Actions</th>
          </tr>
        </thead>

        <tbody>
          {subjects.map((subject) => (
            <tr
              key={subject.id}
              className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/20"
            >
              <td className="px-6 py-4">
                <div>
                  <h4 className="font-medium">{subject.name}</h4>
                </div>
              </td>

              <td className="px-6 py-4 text-sm text-muted-foreground">
                {subject.slug}
              </td>

              {/* <td className="px-6 py-4 text-sm text-muted-foreground">
                {subject.publicationId || "-"}
              </td> */}

              {/* <td className="px-6 py-4 text-sm text-muted-foreground">
                {subject.description || "-"}
              </td> */}

              <td className="px-6 py-4">
                <button
                  onClick={() => handleToggleActive(subject)}
                  disabled={updateMutation.isPending}
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    subject.isActive
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  } disabled:opacity-50`}
                >
                  {subject.isActive ? "Active" : "Inactive"}
                </button>
              </td>

              <td className="px-6 py-4 text-sm text-muted-foreground">
                {new Date(subject.createdAt).toLocaleDateString()}
              </td>

              <td className="px-6 py-4">
                <SubjectActions
                  onEdit={() => onEdit?.(subject)}
                  onDelete={() => handleDelete(subject)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
