"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { permissionService } from "@/lib/services/permission.service"
import type { CreatePermissionRequest, UpdatePermissionRequest } from "@/lib/types/permission"

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: () => permissionService.getPermissions(),
  })
}

export function usePermission(id: string | null) {
  return useQuery({
    queryKey: ["permissions", id],
    queryFn: () => (id ? permissionService.getPermission(id) : null),
    enabled: !!id,
  })
}

export function useCreatePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePermissionRequest) => permissionService.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}

export function useUpdatePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePermissionRequest }) =>
      permissionService.updatePermission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}

export function useDeletePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => permissionService.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}
