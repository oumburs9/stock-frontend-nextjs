import type { AxiosError } from "axios"
import type { UseMutationResult } from "@tanstack/react-query"
import type { FieldValues, UseFormSetError } from "react-hook-form"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"
import { useToast } from "@/hooks/use-toast"

interface UseFormMutationOptions<TForm extends FieldValues, TVariables> {
  mutation: UseMutationResult<any, AxiosError, TVariables>
  setError: UseFormSetError<TForm>
  setFormError?: (message: string | null) => void

  successToast?: {
    title: string
    description?: string
  }

  onSuccess?: () => void
}

export function useFormMutation<TForm extends FieldValues, TVariables>({
  mutation,
  setError,
  setFormError,
  successToast,
  onSuccess,
}: UseFormMutationOptions<TForm, TVariables>) {
  const toast = useToast()

  const submit = (variables: TVariables) => {
    mutation.mutate(variables, {
      onSuccess: () => {
        setFormError?.(null)

        if (successToast) {
          toast.success(successToast.title, successToast.description)
        }

        onSuccess?.()
      },

      onError: (error: AxiosError) => {
        const parsed = parseApiError(error)

        if (parsed.type === "validation") {
          for (const [field, message] of Object.entries(parsed.fieldErrors)) {
            setError(field as any, { message })
          }

          if (parsed.formError) {
            setFormError?.(parsed.formError)
          }

          return
        }

        showApiErrorToast(parsed, toast)
      },
    })
  }

  return {
    submit,
    isPending: mutation.isPending,
  }
}
