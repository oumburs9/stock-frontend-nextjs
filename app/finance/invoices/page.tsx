"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InvoiceTable } from "@/components/finance/invoices/invoice-table"
import { IssueInvoiceDialog } from "@/components/finance/invoices/issue-invoice-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false)
  const router = useRouter()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Customer Invoices"
          description="Manage customer invoices and billing"
          action={
            <Button onClick={() => setIsIssueDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Issue Invoice
            </Button>
          }
        />

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <InvoiceTable searchQuery={searchQuery} />

        <IssueInvoiceDialog
          open={isIssueDialogOpen}
          onOpenChange={setIsIssueDialogOpen}
          onSuccess={(invoiceId) => router.push(`/finance/invoices/${invoiceId}`)}
        />
      </div>
    </DashboardLayout>
  )
}
