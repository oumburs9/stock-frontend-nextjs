"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { useCommissionRules, useDeleteCommissionRule } from "@/lib/hooks/use-agent-sales"
import { CommissionRuleFormDialog } from "./commission-rule-form-dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import type { CommissionRule } from "@/lib/types/agent-sales"

export function CommissionRuleTable() {
  const { toast } = useToast()
  const { data: rules, isLoading } = useCommissionRules()
  const deleteMutation = useDeleteCommissionRule()
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this commission rule?")) return

    try {
      await deleteMutation.mutateAsync(id)
      toast({ title: "Rule deleted", description: "Commission rule deleted successfully" })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete rule",
        variant: "destructive",
      })
    }
  }

  if (isLoading) return <div>Loading commission rules...</div>

  return (
    <div className="border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Validity</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules?.map((rule) => (
            <TableRow key={rule.id}>
              <TableCell className="font-medium">{rule.name}</TableCell>
              <TableCell className="capitalize">{rule.commission_type.replace("_", " ")}</TableCell>
              <TableCell>
                {rule.value}% {rule.currency}
              </TableCell>
              <TableCell>
                {rule.is_active ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle className="h-3 w-3" /> Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="h-3 w-3" /> Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {rule.valid_from ? format(new Date(rule.valid_from), "PP") : "Anytime"}
                {rule.valid_to && ` - ${format(new Date(rule.valid_to), "PP")}`}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingRule(rule)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(rule.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {rules?.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                No commission rules found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <CommissionRuleFormDialog
        open={!!editingRule}
        onOpenChange={(open) => !open && setEditingRule(null)}
        rule={editingRule}
      />
    </div>
  )
}
