// // src/lib/api/classify-api-error.ts
// import type { AxiosError } from "axios"

// export type ApiErrorIntent =
//   | { type: "permission" }
//   | { type: "unauthorized" }
//   | { type: "conflict"; message?: string }
//   | { type: "error"; message?: string }

// export function classifyApiError(error: AxiosError): ApiErrorIntent {
//   const status = error.response?.status
//   const data: any = error.response?.data

//   if (status === 403) return { type: "permission" }
//   if (status === 401) return { type: "unauthorized" }
//   if (status === 409) return { type: "conflict", message: data?.message }

//   return { type: "error", message: data?.message }
// }
