"use client"

import { useState } from "react"
import type { AxiosError } from "axios"
import { ArrowLeft, Plus, Search, MoreHorizontal, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  useAttributeSet,
  useSetItems,
  useBulkAddSetItems,
  useBulkRemoveSetItems,
  useRemoveSetItem,
} from "@/lib/hooks/use-attribute-sets"
import { useAttributes } from "@/lib/hooks/use-attributes"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/hooks/use-auth"

export function AttributeSetDetailContent({ id }: { id: string }) {
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<Set<string>>(new Set())
  const [itemsToDelete, setItemsToDelete] = useState<Set<string>>(new Set())
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null)

  const { hasPermission } = useAuth()
  const { success, error: errorToast, warning } = useToast()

  const { data: set, isLoading } = useAttributeSet(id)
  const { data: items } = useSetItems(id)
  const { data: allAttributes } = useAttributes()

  const bulkAddMutation = useBulkAddSetItems(id)
  const bulkRemoveMutation = useBulkRemoveSetItems(id)
  const removeItemMutation = useRemoveSetItem(id)

  const availableAttributes = allAttributes?.filter(
    (attr) =>
      !items?.some((item) => item.attribute_id === attr.id) &&
      (attr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attr.label.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleToggleAttribute = (attributeId: string) => {
    const next = new Set(selectedAttributeIds)
    next.has(attributeId) ? next.delete(attributeId) : next.add(attributeId)
    setSelectedAttributeIds(next)
  }

  const handleBulkAddAttributes = () => {
    if (selectedAttributeIds.size === 0) return

    bulkAddMutation.mutate(Array.from(selectedAttributeIds), {
      onSuccess: () => {
        success("Attributes added", "Attributes were added to the set successfully.")
        setIsAddDialogOpen(false)
        setSearchQuery("")
        setSelectedAttributeIds(new Set())
      },
      onError: (e: AxiosError) => {
        const parsed = parseApiError(e)
        showApiErrorToast(parsed, { error: errorToast, warning }, "Failed to add attributes.")
      },
    })
  }

  const handleToggleItemDelete = (itemId: string) => {
    const next = new Set(itemsToDelete)
    next.has(itemId) ? next.delete(itemId) : next.add(itemId)
    setItemsToDelete(next)
  }

  const handleBulkRemoveItems = () => {
    if (itemsToDelete.size === 0) return

    bulkRemoveMutation.mutate(Array.from(itemsToDelete), {
      onSuccess: () => {
        success("Attributes removed", "Selected attributes were removed successfully.")
        setItemsToDelete(new Set())
      },
      onError: (e: AxiosError) => {
        const parsed = parseApiError(e)
        showApiErrorToast(parsed, { error: errorToast, warning }, "Failed to remove attributes.")
      },
    })
  }

  const confirmDelete = () => {
    if (!itemToDelete) return

    removeItemMutation.mutate(itemToDelete.id, {
      onSuccess: () => {
        success("Attribute removed", "The attribute was removed from the set successfully.")
        setItemToDelete(null)
      },
      onError: (e: AxiosError) => {
        const parsed = parseApiError(e)
        showApiErrorToast(parsed, { error: errorToast, warning }, "Failed to remove attribute.")
      },
    })
  }

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading...</div>
  }

  if (!set) {
    return <div className="text-center text-muted-foreground">Attribute set not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{set.name}</h1>
        <p className="text-muted-foreground">Manage attributes in this set</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attributes</CardTitle>
              <CardDescription>
                {items?.length || 0} attribute(s)
                {itemsToDelete.size > 0 && ` • ${itemsToDelete.size} selected for removal`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {itemsToDelete.size > 0 && hasPermission("attribute-set:assign-attribute") && (
                <Button
                  variant="destructive"
                  onClick={handleBulkRemoveItems}
                  disabled={bulkRemoveMutation.isPending}
                >
                  Remove {itemsToDelete.size} Selected
                </Button>
              )}
              {hasPermission("attribute-set:assign-attribute") && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Attributes
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {items && items.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12" />
                    <TableHead>Order</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead className="w-[70px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={itemsToDelete.has(item.id)}
                          onCheckedChange={() => handleToggleItemDelete(item.id)}
                          disabled={!hasPermission("attribute-set:assign-attribute")}
                        />
                      </TableCell>
                      <TableCell>{item.sort_order}</TableCell>
                      <TableCell className="font-mono text-sm">{item.attribute?.name}</TableCell>
                      <TableCell className="font-medium">{item.attribute?.label}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-muted rounded text-xs">
                          {item.attribute?.data_type}
                        </span>
                      </TableCell>
                      <TableCell>{item.attribute?.is_required ? "Yes" : "No"}</TableCell>
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
                            {hasPermission("attribute-set:assign-attribute") && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setItemToDelete({
                                    id: item.id,
                                    name: item.attribute?.label || "",
                                  })
                                }
                                className="text-destructive"
                              >
                                Remove
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No attributes in this set
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Attributes to Set</DialogTitle>
            <DialogDescription>
              Select one or multiple attributes to add to this set.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or label..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-64 rounded-md border p-4">
              {availableAttributes && availableAttributes.length > 0 ? (
                <div className="space-y-3">
                  {availableAttributes.map((attr) => (
                    <div
                      key={attr.id}
                      className="p-3 rounded-md border cursor-pointer hover:bg-muted/50"
                      onClick={() => handleToggleAttribute(attr.id)}
                    >
                      <div className="flex gap-3">
                        <Checkbox checked={selectedAttributeIds.has(attr.id)} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{attr.label}</div>
                          <div className="text-xs text-muted-foreground">{attr.name}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No matching attributes found
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAddAttributes}
              disabled={selectedAttributeIds.size === 0 || bulkAddMutation.isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              Add {selectedAttributeIds.size}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Remove Attribute"
        description="Are you sure you want to remove this attribute from the set?"
        itemName={itemToDelete?.name}
      />
    </div>
  )
}
