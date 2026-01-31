"use client"

import { useState } from "react"
import type { AxiosError } from "axios"
import { MoreHorizontal, Plus, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { usePartners, useDeletePartner } from "@/lib/hooks/use-partners"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PartnerFormDialog } from "./partner-form-dialog"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import type { Partner } from "@/lib/types/master-data"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"

export function PartnerTable() {
  const [search, setSearch] = useState("")
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null)
  const [page, setPage] = useState(1)
  const router = useRouter()

  const { hasPermission } = useAuth()
  const { success, error: errorToast, warning } = useToast()

  const { data: partners, isLoading } = usePartners()
  const deleteMutation = useDeletePartner()

  const filteredPartners = partners?.filter(
    (partner) =>
      partner.name.toLowerCase().includes(search.toLowerCase()) ||
      partner.email?.toLowerCase().includes(search.toLowerCase()) ||
      partner.phone?.toLowerCase().includes(search.toLowerCase()),
  )

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner)
    setIsDialogOpen(true)
  }

  const handleDelete = (partner: Partner) => {
    setPartnerToDelete(partner)
  }

  const confirmDelete = () => {
    if (!partnerToDelete) return

    deleteMutation.mutate(partnerToDelete.id, {
      onSuccess: () => {
        success("Partner deleted", "The partner was deleted successfully.")
        setPartnerToDelete(null)
      },
      onError: (e: AxiosError) => {
        const parsed = parseApiError(e)
        showApiErrorToast(parsed, { error: errorToast, warning }, "Failed to delete partner.")
      },
    })
  }

  const handleViewDetails = (id: string) => {
    router.push(`/master-data/partners/${id}`)
  }

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedPartners = filteredPartners?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((filteredPartners?.length || 0) / itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search partners..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        {hasPermission("partner:create") && (
          <Button
            onClick={() => {
              setSelectedPartner(null)
              setIsDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Partner
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedPartners?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No partners found
                </TableCell>
              </TableRow>
            ) : (
              paginatedPartners?.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
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
                  </TableCell>
                  <TableCell className="text-muted-foreground">{partner.phone || "-"}</TableCell>
                  <TableCell className="font-mono text-sm">{partner.email || "-"}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleViewDetails(partner.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {hasPermission("partner:update") && (
                          <DropdownMenuItem onClick={() => handleEdit(partner)}>Edit</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {hasPermission("partner:delete") && (
                          <DropdownMenuItem onClick={() => handleDelete(partner)} className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredPartners && filteredPartners.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPartners.length)} of{" "}
            {filteredPartners.length} partners
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

      <PartnerFormDialog partner={selectedPartner} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <ConfirmDeleteDialog
        open={!!partnerToDelete}
        onOpenChange={(open) => !open && setPartnerToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Partner"
        description="Are you sure you want to delete this partner? This action cannot be undone."
        itemName={partnerToDelete?.name}
      />
    </div>
  )
}
