import type { ParsedApiError } from "./parse-api-error"
import { useToast } from "@/hooks/use-toast"

/**
 * Toast dispatcher for non-validation API errors.
 * Validation errors must NEVER reach here.
 */
export function showApiErrorToast(
  parsed: ParsedApiError,
  toast: Pick<ReturnType<typeof useToast>, "error" | "warning">,
  fallbackMessage?: string,
) {
  switch (parsed.type) {
    case "permission":
      toast.error(
        "Permission denied",
        "You do not have permission to perform this action.",
      )
      return

    case "unauthorized":
      toast.error(
        "Session expired",
        "Please log in again to continue.",
      )
      return

    case "conflict":
      toast.warning(
        "Conflict detected",
        parsed.message ?? "This action conflicts with system state.",
      )
      return

    case "error":
      toast.error(
        "Unexpected error",
        parsed.message ?? fallbackMessage ?? "Something went wrong. Please try again.",
      )
      return

    case "validation":
      // Never toast validation
      return
  }
}
