import type { AxiosError } from "axios"

export type ParsedApiError =
  | {
      type: "validation"
      fieldErrors: Record<string, string>
      formError?: string
    }
  | {
      type: "permission"
    }
  | {
      type: "unauthorized"
    }
  | {
      type: "conflict"
      message?: string
    }
  | {
      type: "error"
      message?: string
    }

/**
 * Transforms backend errors into a UI-safe, typed structure.
 * This is the ONLY place backend messages are interpreted.
 */
export function parseApiError(error: AxiosError): ParsedApiError {
  // console.log(error)
  const status = error.response?.status
  const data: any = error.response?.data
  console.log(data)

  // 400 — validation
  if (status === 400 && Array.isArray(data?.message)) {
    const fieldErrors: Record<string, string> = {}
    let formError: string | undefined

    for (const err of data.message) {
      const field = err?.field
      const rawMessage = err?.message

      if (!rawMessage) continue

      const message = formatMessage(rawMessage)

      if (!field || String(field).startsWith("_")) {
        formError = message
      } else {
        fieldErrors[field] = message
      }
    }

    return { type: "validation", fieldErrors, formError }
  }

  if (status === 403) return { type: "permission" }
  if (status === 401) return { type: "unauthorized" }
  if (status === 409) return { type: "conflict", message: formatMessage(data?.message) }

  return { type: "error", message: formatMessage(data?.message) }
}

/**
 * Converts backend / validator messages into human-friendly text.
 * Backend messages must NEVER be shown directly.
 */
function formatMessage(message?: string): string {
  if (!message) return "Something went wrong"

  let text = message

  // Known validator normalizations
  text = text.replace(/^email must be an email$/i, "Please enter a valid email address")
  text = text.replace(
    /^password must be longer than or equal to (\d+) characters$/i,
    "Password must be at least $1 characters",
  )
  text = text.replace(/^(.+) must be a UUID$/i, "Invalid selection")

  // Capitalize
  text = text.charAt(0).toUpperCase() + text.slice(1)

  return text
}
