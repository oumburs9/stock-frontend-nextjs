import type { ExportFormat } from "@/lib/types/report"

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const getExportFilename = (reportName: string, format: ExportFormat): string => {
  const timestamp = new Date().toISOString().split("T")[0]
  const extension = format === "excel" ? "xlsx" : format
  return `${reportName}-${timestamp}.${extension}`
}

export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

export const formatNumber = (num: number | string): string => {
  const numValue = typeof num === "string" ? Number.parseFloat(num) : num
  return new Intl.NumberFormat("en-US").format(numValue)
}

export const formatPercentage = (value: number | string | undefined): string => {
  if (value === undefined || value === null) {
    return "0.00%"
  }
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value
  if (Number.isNaN(numValue)) {
    return "0.00%"
  }
  return `${numValue.toFixed(2)}%`
}
