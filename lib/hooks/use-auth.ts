"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { authService } from "@/lib/services/auth.service"
import { useRouter } from "next/navigation"
import type { LoginRequest, ChangePasswordRequest } from "@/lib/types/auth"

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => authService.getCurrentUser(),
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      router.push("/dashboard")
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear()
      router.push("/login")
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
  })

  const hasPermission = (permission: string) => {
    return authService.hasPermission(permission, user || null)
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    hasPermission,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
  }
}
