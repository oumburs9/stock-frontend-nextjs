"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { userService } from "@/lib/services/user.service"
import type { CreateUserRequest, UpdateUserRequest, User } from "@/lib/types/user"

export function useUsers() {
  return useQuery<User[], AxiosError>({
    queryKey: ["users"],
    queryFn: () => userService.getUsers(),
  })
}

export function useUser(id: string | null) {
  return useQuery<User | null, AxiosError>({
    queryKey: ["users", id],
    queryFn: () => (id ? userService.getUser(id) : null),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation<User, AxiosError, CreateUserRequest>({
    mutationFn: (data) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { id: string; data: UpdateUserRequest }>({
    mutationFn: ({ id, data }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { id: string; isActive: boolean }>({
    mutationFn: ({ id, isActive }) => userService.updateUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUserRoles() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { id: string; roleIds: string[] }>({
    mutationFn: ({ id, roleIds }) => userService.updateUserRoles(id, roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
