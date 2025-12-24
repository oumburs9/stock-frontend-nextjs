"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useSidebarState } from "@/hooks/use-sidebar-state"
import type { MenuItem } from "@/lib/config/sidebar-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SidebarNavigationProps {
  items: MenuItem[]
}

export function SidebarNavigation({ items }: SidebarNavigationProps) {
  const { hasPermission } = useAuth()
  const { isOpen, toggle, hydrated } = useSidebarState()

  const filterMenuItems = React.useCallback(
    (menuItems: MenuItem[]): MenuItem[] => {
      return menuItems
        .filter((item) => hasPermission(item.permission))
        .map((item) => {
          if (item.children) {
            const filteredChildren = filterMenuItems(item.children)
            if (filteredChildren.length > 0 || item.path) {
              return { ...item, children: filteredChildren }
            }
            return null
          }
          return item
        })
        .filter((item): item is MenuItem => item !== null)
    },
    [hasPermission],
  )

  const visibleItems = React.useMemo(() => filterMenuItems(items), [items, filterMenuItems])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleItems.map((item) => (
            <NavItem key={item.label} item={item} isOpen={isOpen} toggle={toggle} hydrated={hydrated} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function NavItem({
  item,
  isOpen,
  toggle,
  hydrated,
}: {
  item: MenuItem
  isOpen: (id: string) => boolean
  toggle: (id: string) => void
  hydrated: boolean
}) {
  const pathname = usePathname()

  const open = item.id ? isOpen(item.id) : false

  const isActive = item.path === pathname
  const Icon = item.icon

  if (item.collapsible && item.children && item.children.length > 0) {
    if (!item.id) {
      console.warn(`[v0] Collapsible item "${item.label}" is missing an id for state tracking`)
    }

    return (
      <Collapsible open={hydrated ? open : false} onOpenChange={() => item.id && toggle(item.id)} asChild>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.label}>
              <Icon className="size-4" />
              <span>{item.label}</span>
              <ChevronRight
                className="ml-auto size-4 transition-transform duration-200"
                style={{
                  transform: hydrated && open ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => {
                const ChildIcon = child.icon
                const isChildItemActive = child.path === pathname
                return (
                  <SidebarMenuSubItem key={child.label}>
                    <SidebarMenuSubButton asChild isActive={isChildItemActive}>
                      <Link href={child.path || "#"}>
                        <ChildIcon className="size-4" />
                        <span>{child.label}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
        <Link href={item.path || "#"}>
          <Icon className="size-4" />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
