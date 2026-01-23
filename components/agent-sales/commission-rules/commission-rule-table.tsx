"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2, Plus, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCommissionRules, useDeleteCommissionRule } from "@/lib/hooks/use-agent-sales"
import { CommissionRuleFormDialog } from "./commission-rule-form-dialog"
import type { CommissionRule } from "@/lib/types/agent-sales"
import { useAuth } from "@/lib/hooks/use-auth"

export function CommissionRuleTable() {
  const { data: rules = [], isLoading } = useCommissionRules()
  const deleteCommissionRule = useDeleteCommissionRule()
  const [search, setSearch] = useState("")
  const [selectedRule, setSelectedRule] = useState<CommissionRule | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { hasPermission } = useAuth()

  const filteredRules = rules.filter((rule) => rule.name.toLowerCase().includes(search.toLowerCase()))

  const handleEdit = (rule: CommissionRule) => {
    setSelectedRule(rule)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this commission rule?")) {
      deleteCommissionRule.mutate(id)
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setSelectedRule(null)
  }

  const handleAddNew = () => {
    setSelectedRule(null)
    setIsFormOpen(true)
  }

  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground">Loading commission rules...</div>
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {hasPermission('commission-rule:create') && (
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>)}
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Valid From</TableHead>
              <TableHead>Valid To</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {search ? "No commission rules match your search" : "No commission rules found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredRules.map((rule) => (
                <TableRow key={rule.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {rule.commission_type === "license_use" ? "License Use" : "Principal Commission"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">{rule.value}%</TableCell>
                  <TableCell className="font-mono text-sm">{rule.currency}</TableCell>
                  <TableCell className="text-sm">
                    {rule.valid_from ? new Date(rule.valid_from).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {rule.valid_to ? new Date(rule.valid_to).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        rule.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {rule.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {hasPermission("commission-rule:update") && (<DropdownMenuItem onClick={() => handleEdit(rule)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>)}
                        {hasPermission("commission-rule:delete") && (<DropdownMenuItem onClick={() => handleDelete(rule.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
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

      <CommissionRuleFormDialog open={isFormOpen} onOpenChange={handleFormClose} editingRule={selectedRule} />
    </>
  )
}
