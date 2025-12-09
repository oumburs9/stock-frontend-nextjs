"use client"

import { useState } from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchableSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: Array<{ id: string; name: string; label?: string }>
  placeholder?: string
  searchPlaceholder?: string
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
}: SearchableSelectProps) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  const filteredOptions = options.filter((option) =>
    (option.name || option.label || "").toLowerCase().includes(search.toLowerCase()),
  )

  const selectedOption = options.find((o) => o.id === value)

  return (
    <div className="relative">
      <Button
        variant="outline"
        role="combobox"
        className={cn("w-full justify-between", !value && "text-muted-foreground")}
        onClick={() => setOpen(!open)}
      >
        {selectedOption ? <span>{selectedOption.name || selectedOption.label}</span> : <span>{placeholder}</span>}
        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-md shadow-md z-50">
          <div className="p-2 border-b">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onValueChange(option.id)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={cn(
                    "w-full text-left px-2 py-2 hover:bg-accent rounded cursor-pointer flex items-center gap-2",
                    value === option.id && "bg-accent",
                  )}
                >
                  <Check className={cn("h-4 w-4", value === option.id ? "opacity-100" : "opacity-0")} />
                  <span className="text-sm">{option.name || option.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
