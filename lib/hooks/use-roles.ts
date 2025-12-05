"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { roleService } from "@/lib/services/role.service"
import type { CreateRoleRequest, UpdateRoleRequest } from "@/lib/types/role"

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.getRoles(),
  })
}

export function useRole(id: string | null) {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: () => (id ? roleService.getRole(id) : null),
    enabled: !!id,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => roleService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) => roleService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useRolePermissions(id: string | null) {
  return useQuery({
    queryKey: ["roles", id, "permissions"],
    queryFn: () => (id ? roleService.getRolePermissions(id) : null),
    enabled: !!id,
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, permissionIds }: { id: string; permissionIds: string[] }) =>
      roleService.updateRolePermissions(id, permissionIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles", variables.id, "permissions"] })
    },
  })
}
