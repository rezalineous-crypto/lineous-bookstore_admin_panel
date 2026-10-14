"use client";

import { useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";

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
import { UsersTable } from "@/components/users/users-table";
import { UserDialog } from "@/components/users/user-dialog";
import { CustomerStats } from "@/components/users/customer-stats";
import { TopCustomers } from "@/components/users/top-customers";
import type { User, UserRole, UserStatus } from "@/lib/types/book";
import { UserRole as UserRoleEnum, UserStatus as UserStatusEnum } from "@/constants/status";
import { useDeleteUser } from "@/lib/hooks/use-users";
import { useCustomerInsights } from "@/lib/hooks/use-analytics";

export default function UsersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: customerData, isLoading: customerLoading } = useCustomerInsights();
  const deleteMutation = useDeleteUser();

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      await deleteMutation.mutateAsync(selectedUser.id);
    }
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="mt-2 text-muted-foreground">
            Manage user accounts and permissions.
          </p>
        </div>

        <UserDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          }
        />
      </div>

      {/* Customer Stats */}
      {!customerLoading && customerData && (
        <CustomerStats summary={customerData.summary} />
      )}

      <UsersTable onEdit={handleEdit} onDelete={handleDelete} />

      {/* Top Customers */}
      {!customerLoading && customerData && customerData.topCustomers.length > 0 && (
        <TopCustomers customers={customerData.topCustomers} />
      )}

      {/* Edit Dialog */}
      <UserDialog
        user={selectedUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedUser?.email}&quot;? This action will soft delete the user.
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
