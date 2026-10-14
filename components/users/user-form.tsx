"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";

import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { CustomInput } from "@/components/ui/custom-input";
import {
  useCreateUser,
  useUpdateUser,
} from "@/lib/hooks/use-users";
import type { User, UpdateUserDto, UserRole, UserStatus } from "@/lib/types/book";
import { UserRole as UserRoleEnum, UserStatus as UserStatusEnum } from "@/constants/status";

type UserFormValues = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  role?: UserRole;
  avatar?: string;
  status?: UserStatus;
};

interface UserFormProps {
  user?: User | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  formId?: string;
  onSubmittingChange?: (submitting: boolean) => void;
}

export function UserForm({
  user,
  onSuccess,
  formId,
  onSubmittingChange,
}: UserFormProps) {
  const isEditing = !!user;

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Report the mutation's pending state so the modal footer can reflect it.
  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  const { register, handleSubmit, setValue, watch } = useForm<UserFormValues>({
    defaultValues: {
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      password: "",
      role: user?.role || "USER",
      avatar: user?.avatar || "",
      status: user?.status || "ACTIVE",
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    if (isEditing && user) {
      const updateData: UpdateUserDto = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: data.password || undefined,
        avatar: data.avatar,
        role: data.role,
        status: data.status,
      };
      await updateMutation.mutateAsync({ id: user.id, data: updateData });
    } else {
      const createData = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: data.password,
        role: data.role || "USER",
        avatar: data.avatar,
        status: data.status || "ACTIVE",
      };
      await createMutation.mutateAsync(createData);
    }

    onSuccess?.();
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 pt-6"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CustomInput
          id="email"
          label="Email"
          type="email"
          placeholder="user@example.com"
          {...register("email")}
          required
        />

        <CustomInput
          id="phone"
          label="Phone"
          placeholder="+8801712345678"
          {...register("phone")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CustomInput
          id="firstName"
          label="First Name"
          placeholder="John"
          {...register("firstName")}
        />

        <CustomInput
          id="lastName"
          label="Last Name"
          placeholder="Doe"
          {...register("lastName")}
        />
      </div>

      {!isEditing && (
        <CustomInput
          id="password"
          label="Password"
          type="password"
          placeholder="Min. 6 characters"
          {...register("password")}
        />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SearchableDropdown
          label="Role"
          items={UserRoleEnum.map((role) => ({ id: role, label: role }))}
          value={watch("role") || "USER"}
          onChange={(item) => {
            if (item) setValue("role", item.id as UserRole);
          }}
          placeholder="Select role"
        />

        <SearchableDropdown
          label="Status"
          items={UserStatusEnum.map((status) => ({ id: status, label: status.charAt(0) + status.slice(1).toLowerCase() }))}
          value={watch("status") || "ACTIVE"}
          onChange={(item) => {
            if (item) setValue("status", item.id as UserStatus);
          }}
          placeholder="Select status"
        />
      </div>

      <CustomInput
        id="avatar"
        label="Avatar URL"
        placeholder="https://example.com/avatar.png"
        {...register("avatar")}
      />
    </form>
  );
}
