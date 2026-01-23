"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { usePricingRules, useDeletePricingRule, useUpdatePricingRule } from "@/lib/hooks/use-sales"
import type { PricingRule } from "@/lib/types/sales"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Pencil, Trash2, Power, PowerOff, ChevronLeft, ChevronRight } from "lucide-react"
import { PricingRuleFormDialog } from "./pricing-rule-form-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/hooks/use-auth"

export function PricingRulesTable() {
  const router = useRouter()
  const { data: rules, isLoading } = usePricingRules()
  const deleteRule = useDeletePricingRule()
  const updateRule = useUpdatePricingRule()

  const [editingRule, setEditingRule] = useState<PricingRule | null>(null)
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const { hasPermission } = useAuth()

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedRules = rules?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((rules?.length || 0) / itemsPerPage)

  const handleToggleActive = (rule: PricingRule) => {
    updateRule.mutate({ id: rule.id, data: { isActive: !rule.is_active } })
  }

  const handleDelete = () => {
    if (deletingRuleId) {
      deleteRule.mutate(deletingRuleId, {
        onSuccess: () => setDeletingRuleId(null),
      })
    }
  }

  const getTargetDisplay = (rule: PricingRule) => {
    switch (rule.target_type) {
      case "all":
        return "All Products"
      case "product":
        return `Product: ${rule.target_product_id?.slice(0, 8)}...`
      case "category":
        return `Category: ${rule.target_category_id?.slice(0, 8)}...`
      case "brand":
        return `Brand: ${rule.target_brand_id?.slice(0, 8)}...`
      default:
        return rule.target_type
    }
  }

  const getPriceDisplay = (rule: PricingRule) => {
    if (rule.margin_percent) {
      return `${rule.margin_percent}% Margin`
    }
    if (rule.fixed_price) {
      return `Fixed: ${Number.parseFloat(rule.fixed_price).toLocaleString()}`
    }
    return "N/A"
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (!rules || rules.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No pricing rules found</p>
        <p className="text-sm text-muted-foreground mt-1">Create your first pricing rule to get started</p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule Name</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Valid Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRules?.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{rule.name}</p>
                    {rule.description && <p className="text-sm text-muted-foreground">{rule.description}</p>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getTargetDisplay(rule)}</Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{getPriceDisplay(rule)}</span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {rule.valid_from || rule.valid_to ? (
                      <>
                        <div>{rule.valid_from ? `From: ${rule.valid_from}` : "No start"}</div>
                        <div>{rule.valid_to ? `To: ${rule.valid_to}` : "No end"}</div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Always active</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={rule.is_active ? "default" : "secondary"}>
                    {rule.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {hasPermission("pricing-rule:update") && (<DropdownMenuItem onClick={() => setEditingRule(rule)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>)}
                      {/* {hasPermission("pricing-rule:update-status") && ( */}
                      {hasPermission("pricing-rule:update") && (
                        <DropdownMenuItem onClick={() => handleToggleActive(rule)}>
                        {rule.is_active ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>)}
                      {hasPermission("pricing-rule:delete") && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeletingRuleId(rule.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {rules && rules.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, rules.length)} of {rules.length} pricing
            rules
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                  className="w-8 h-8 p-0"
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {editingRule && (
        <PricingRuleFormDialog
          open={!!editingRule}
          onOpenChange={(open) => !open && setEditingRule(null)}
          pricingRule={editingRule}
        />
      )}

      <AlertDialog open={!!deletingRuleId} onOpenChange={() => setDeletingRuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pricing Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this pricing rule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
