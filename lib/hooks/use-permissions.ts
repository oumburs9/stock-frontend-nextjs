import type { AxiosError } from "axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { permissionService } from "@/lib/services/permission.service"
import type {
  CreatePermissionRequest,
  UpdatePermissionRequest,
  Permission,
} from "@/lib/types/permission"

export function usePermissions() {
  return useQuery<Permission[], AxiosError>({
    queryKey: ["permissions"],
    queryFn: () => permissionService.getPermissions(),
  })
}

export function usePermission(id: string | null) {
  return useQuery<Permission | null, AxiosError>({
    queryKey: ["permissions", id],
    queryFn: () => (id ? permissionService.getPermission(id) : null),
    enabled: !!id,
  })
}

export function useCreatePermission() {
  const queryClient = useQueryClient()

  return useMutation<Permission, AxiosError, CreatePermissionRequest>({
    mutationFn: (data) => permissionService.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}

export function useUpdatePermission() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { id: string; data: UpdatePermissionRequest }>({
    mutationFn: ({ id, data }) => permissionService.updatePermission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}

export function useDeletePermission() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: (id) => permissionService.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}
