import { format, subDays, startOfDay, endOfDay } from "date-fns"

export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "yyyy-MM-dd")
}

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "MMM dd, yyyy 'at' hh:mm a")
}

export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "MMM dd, yyyy")
}

export const getDateRangePreset = (preset: string): { from: Date; to: Date } => {
  const now = new Date()
  const today = startOfDay(now)

  switch (preset) {
    case "today":
      return { from: today, to: endOfDay(now) }
    case "yesterday":
      return {
        from: startOfDay(subDays(now, 1)),
        to: endOfDay(subDays(now, 1)),
      }
    case "last7days":
      return { from: startOfDay(subDays(now, 7)), to: endOfDay(now) }
    case "last30days":
      return { from: startOfDay(subDays(now, 30)), to: endOfDay(now) }
    case "last90days":
      return { from: startOfDay(subDays(now, 90)), to: endOfDay(now) }
    default:
      return { from: startOfDay(subDays(now, 30)), to: endOfDay(now) }
  }
}

export const toISODateString = (date: Date): string => {
  return date.toISOString()
}
