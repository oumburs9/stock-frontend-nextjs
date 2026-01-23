"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash, ChevronLeft, ChevronRight } from "lucide-react"
import { useTaxRules, useDeleteTaxRule } from "@/lib/hooks/use-finance"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { TaxRuleFormDialog } from "./tax-rule-form-dialog"
import type { TaxRule } from "@/lib/types/finance"
import { useAuth } from "@/lib/hooks/use-auth"

export function TaxRulesTable() {
  const [page, setPage] = useState(1)
  const [selectedRule, setSelectedRule] = useState<TaxRule | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [ruleToDelete, setRuleToDelete] = useState<TaxRule | null>(null)

  const { hasPermission } = useAuth()
  const { data: taxRules, isLoading } = useTaxRules()
  const deleteMutation = useDeleteTaxRule()

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedRules = taxRules?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((taxRules?.length || 0) / itemsPerPage)

  const handleEdit = (rule: TaxRule) => {
    setSelectedRule(rule)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (ruleToDelete) {
      await deleteMutation.mutateAsync(ruleToDelete.id)
      setRuleToDelete(null)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valid From</TableHead>
              <TableHead>Valid To</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedRules?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No tax rules found
                </TableCell>
              </TableRow>
            ) : (
              paginatedRules?.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell className="font-mono">{rule.rate}%</TableCell>
                  <TableCell>
                    {rule.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>{rule.valid_from ? new Date(rule.valid_from).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{rule.valid_to ? new Date(rule.valid_to).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {hasPermission('tax-rule:update') && (<DropdownMenuItem onClick={() => handleEdit(rule)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>)}
                        <DropdownMenuSeparator />
                        {hasPermission('tax-rule:delete') && (<DropdownMenuItem onClick={() => setRuleToDelete(rule)} className="text-destructive">
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {taxRules && taxRules.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, taxRules.length)} of {taxRules.length} tax
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

      <TaxRuleFormDialog
        taxRule={selectedRule}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setSelectedRule(null)
        }}
      />

      <AlertDialog open={!!ruleToDelete} onOpenChange={(open) => !open && setRuleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tax rule? This action cannot be undone.
              <span className="block mt-2 font-semibold text-foreground">{ruleToDelete?.name}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
