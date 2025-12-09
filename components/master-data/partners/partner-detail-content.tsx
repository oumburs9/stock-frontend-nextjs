"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { partnerService } from "@/lib/services/partner.service"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export function PartnerDetailContent({ id }: { id: string }) {
  const router = useRouter()

  const { data: partner, isLoading } = useQuery({
    queryKey: ["partners", id],
    queryFn: () => partnerService.getPartner(id),
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!partner) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground">Partner not found</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Users className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">{partner.name}</h1>
            <p className="text-muted-foreground">Partner Details</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Partner metadata and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Name</div>
                <div className="text-base">{partner.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Type</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {partner.is_supplier && (
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-xs">
                      Supplier
                    </span>
                  )}
                  {partner.is_customer && (
                    <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs">
                      Customer
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Phone</div>
                <div className="text-base">{partner.phone || "-"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Email</div>
                <div className="text-base font-mono text-sm">{partner.email || "-"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Financial and business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Address</div>
                <div className="text-base">{partner.address || "-"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Tax Number</div>
                <div className="text-base">{partner.tax_number || "-"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Credit Limit</div>
                <div className="text-base">{partner.credit_limit != null && !isNaN(Number(partner.credit_limit)) ? `$${Number(partner.credit_limit).toFixed(2)}`: "-"}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}