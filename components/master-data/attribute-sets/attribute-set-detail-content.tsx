"use client"

import { useState } from "react"
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

export function AttributeSetDetailContent({ id }: { id: string }) {
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<Set<string>>(new Set())
  const [itemsToDelete, setItemsToDelete] = useState<Set<string>>(new Set())
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null)

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
    const newSelected = new Set(selectedAttributeIds)
    if (newSelected.has(attributeId)) {
      newSelected.delete(attributeId)
    } else {
      newSelected.add(attributeId)
    }
    setSelectedAttributeIds(newSelected)
  }

  const handleBulkAddAttributes = () => {
    if (selectedAttributeIds.size > 0) {
      bulkAddMutation.mutate(Array.from(selectedAttributeIds), {
        onSuccess: () => {
          setIsAddDialogOpen(false)
          setSearchQuery("")
          setSelectedAttributeIds(new Set())
        },
      })
    }
  }

  const handleToggleItemDelete = (itemId: string) => {
    const newItems = new Set(itemsToDelete)
    if (newItems.has(itemId)) {
      newItems.delete(itemId)
    } else {
      newItems.add(itemId)
    }
    setItemsToDelete(newItems)
  }

  const handleBulkRemoveItems = () => {
    if (itemsToDelete.size > 0) {
      bulkRemoveMutation.mutate(Array.from(itemsToDelete), {
        onSuccess: () => {
          setItemsToDelete(new Set())
        },
      })
    }
  }

  const handleRemoveItem = (itemId: string, attributeName: string) => {
    setItemToDelete({ id: itemId, name: attributeName })
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      removeItemMutation.mutate(itemToDelete.id)
      setItemToDelete(null)
    }
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
                {items?.length || 0} attribute(s) in this set
                {itemsToDelete.size > 0 && ` • ${itemsToDelete.size} selected for removal`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {itemsToDelete.size > 0 && (
                <Button variant="destructive" onClick={handleBulkRemoveItems} disabled={bulkRemoveMutation.isPending}>
                  Remove {itemsToDelete.size} Selected
                </Button>
              )}
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Attributes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {items && items.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={itemsToDelete.size > 0 && itemsToDelete.size === items.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setItemsToDelete(new Set(items.map((item) => item.id)))
                          } else {
                            setItemsToDelete(new Set())
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={itemsToDelete.has(item.id)}
                          onCheckedChange={() => handleToggleItemDelete(item.id)}
                        />
                      </TableCell>
                      <TableCell>{item.sort_order}</TableCell>
                      <TableCell className="font-mono text-sm">{item.attribute?.name}</TableCell>
                      <TableCell className="font-medium">{item.attribute?.label}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-muted rounded text-xs">{item.attribute?.data_type}</span>
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
                            <DropdownMenuItem
                              onClick={() => handleRemoveItem(item.id, item.attribute?.label || "")}
                              className="text-destructive"
                            >
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">No attributes in this set</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Attributes to Set</DialogTitle>
            <DialogDescription>
              Select one or multiple attributes to add to this set. Use the checkboxes for bulk selection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search Attributes</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or label..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Available Attributes
                  {selectedAttributeIds.size > 0 && ` • ${selectedAttributeIds.size} selected`}
                </Label>
                {selectedAttributeIds.size > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedAttributeIds(new Set())}>
                    Clear Selection
                  </Button>
                )}
              </div>
              <ScrollArea className="h-64 rounded-md border p-4">
                {availableAttributes && availableAttributes.length > 0 ? (
                  <div className="space-y-3">
                    {availableAttributes.map((attr) => (
                      <div
                        key={attr.id}
                        className="p-3 rounded-md border border-transparent hover:border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleToggleAttribute(attr.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedAttributeIds.has(attr.id)}
                            onCheckedChange={() => handleToggleAttribute(attr.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{attr.label}</div>
                            <div className="text-xs text-muted-foreground">{attr.name}</div>
                            <div className="flex gap-2 mt-2">
                              <span className="px-2 py-1 bg-muted rounded text-xs">{attr.data_type}</span>
                              {attr.is_required && (
                                <span className="px-2 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded text-xs">
                                  Required
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {searchQuery ? "No matching attributes found" : "All attributes are already in this set"}
                  </div>
                )}
              </ScrollArea>
            </div>
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
              Add {selectedAttributeIds.size} Attribute{selectedAttributeIds.size !== 1 ? "s" : ""}
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
