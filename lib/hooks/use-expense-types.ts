import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { expenseTypeService } from "@/lib/services/purchase.service"
import type { CreateExpenseTypeRequest, UpdateExpenseTypeRequest } from "@/lib/types/purchase"
import { toast } from "@/hooks/use-toast"

export function useExpenseTypes(params?: { q?: string; scope?: "shipment" | "batch"; active?: boolean }) {
  return useQuery({
    queryKey: ["expense-types", params],
    queryFn: async () => {
      const data = await expenseTypeService.getExpenseTypes(params)
      return Array.isArray(data) ? data : []
    },
    select: (data) => data || [],
  })
}

export function useExpenseType(id: string | null) {
  return useQuery({
    queryKey: ["expense-types", id],
    queryFn: () => (id ? expenseTypeService.getExpenseType(id) : null),
    enabled: !!id,
  })
}

export function useCreateExpenseType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExpenseTypeRequest) => expenseTypeService.createExpenseType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-types"] })
      toast({ title: "Expense type created successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create expense type",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}

export function useUpdateExpenseType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseTypeRequest }) =>
      expenseTypeService.updateExpenseType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-types"] })
      toast({ title: "Expense type updated successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update expense type",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}

export function useDeleteExpenseType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => expenseTypeService.deleteExpenseType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-types"] })
      toast({ title: "Expense type deleted successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete expense type",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}
