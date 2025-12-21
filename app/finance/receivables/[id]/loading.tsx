import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function ReceivableDetailLoading() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading receivable...</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
