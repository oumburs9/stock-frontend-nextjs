import type { AxiosError } from "axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { roleService } from "@/lib/services/role.service"
import type { CreateRoleRequest, UpdateRoleRequest, Role, RolePermissions } from "@/lib/types/role"
import type { Permission } from "@/lib/types/permission"

export function useRoles() {
  return useQuery<Role[], AxiosError>({
    queryKey: ["roles"],
    queryFn: () => roleService.getRoles(),
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation<Role, AxiosError, CreateRoleRequest>({
    mutationFn: (data) => roleService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { id: string; data: UpdateRoleRequest }>({
    mutationFn: ({ id, data }) => roleService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: (id) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useRolePermissions(id: string | null) {
  return useQuery<Permission[], AxiosError>({
    queryKey: ["roles", id, "permissions"],
    queryFn: () => (id ? roleService.getRolePermissions(id) : Promise.resolve([])),
    enabled: !!id,
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()

  return useMutation<RolePermissions, AxiosError, { id: string; permissionIds: string[] }>({
    mutationFn: ({ id, permissionIds }) =>
      roleService.updateRolePermissions(id, permissionIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["roles", variables.id, "permissions"],
      })
    },
  })
}
