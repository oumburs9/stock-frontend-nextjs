"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AgentSaleTable } from "@/components/agent-sales/agent-sale-table"
import { AgentSaleFormDialog } from "@/components/agent-sales/agent-sale-form-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { RequirePermission } from "@/components/auth/require-permission"
import { useAuth } from "@/lib/hooks/use-auth"

export default function AgentSalesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { hasPermission } = useAuth()

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
  }

  const hasFilters = searchQuery || statusFilter !== "all"

  return (
    <DashboardLayout>
      <RequirePermission permission="agent-sale:view">
        <div className="space-y-6">
          <PageHeader
            title="Agent Sales"
            description="Manage agent sales transactions and commissions"
            action={
              hasPermission("agent-sale:create") ? (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Agent Sale
                </Button>
              ) : null
            }
          />

          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                  </SelectContent>
                </Select>
                {hasFilters && (
                  <Button size="sm" variant="ghost" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <AgentSaleTable searchQuery={searchQuery} statusFilter={statusFilter} />

          <AgentSaleFormDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
