"use client"

import { memo, useCallback, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight, LogOut, UserIcon } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { sidebarMenu, type MenuItem } from "@/lib/config/sidebar-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "./theme-toggle"

const SIDEBAR_MENU_STATE_KEY = "sidebar-menu-state"

function getInitialMenuState(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    const saved = localStorage.getItem(SIDEBAR_MENU_STATE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function saveMenuState(state: Record<string, boolean>) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(SIDEBAR_MENU_STATE_KEY, JSON.stringify(state))
  } catch {
    // Ignore errors
  }
}

const SidebarMenuItem = memo(
  ({
    item,
    level = 0,
    isOpen,
    onToggle,
  }: {
    item: MenuItem
    level?: number
    isOpen: boolean
    onToggle: () => void
  }) => {
    const pathname = usePathname()
    const { hasPermission } = useAuth()

    // Check permission
    if (item.permission && !hasPermission(item.permission)) {
      return null
    }

    const isActive = item.path && pathname === item.path
    const hasChildren = item.children && item.children.length > 0

    if (item.collapsible && hasChildren) {
      return (
        <div className="space-y-1">
          <button
            onClick={onToggle}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "text-sidebar-foreground/70",
            )}
            style={{ paddingLeft: `${0.75 + level * 1}rem` }}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left font-medium">{item.label}</span>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {isOpen && (
            <div className="space-y-1">
              {item.children?.map((child, i) => (
                <SidebarMenuItemWrapper key={child.path || i} item={child} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      )
    }

    if (item.path) {
      return (
        <Link
          href={item.path}
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
          style={{ paddingLeft: `${0.75 + level * 1}rem` }}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span>{item.label}</span>
        </Link>
      )
    }

    return null
  },
)

SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuItemWrapper = memo(({ item, level = 0 }: { item: MenuItem; level?: number }) => {
  const [menuState, setMenuState] = useState<Record<string, boolean>>(getInitialMenuState)

  const itemKey = item.path || item.label.toLowerCase().replace(/\s+/g, "-")
  const isOpen = menuState[itemKey] ?? false

  const handleToggle = useCallback(() => {
    setMenuState((prev) => {
      const newState = { ...prev, [itemKey]: !prev[itemKey] }
      saveMenuState(newState)
      return newState
    })
  }, [itemKey])

  return <SidebarMenuItem item={item} level={level} isOpen={isOpen} onToggle={handleToggle} />
})

SidebarMenuItemWrapper.displayName = "SidebarMenuItemWrapper"

export function AppSidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <h1 className="text-lg font-semibold text-sidebar-foreground">ERP System</h1>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarMenu.map((item, i) => (
          <SidebarMenuItemWrapper key={item.path || i} item={item} />
        ))}
      </nav>

      {/* User Menu */}
      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-2">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="text-sm font-medium truncate w-full text-left">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-muted-foreground truncate w-full text-left">{user?.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
