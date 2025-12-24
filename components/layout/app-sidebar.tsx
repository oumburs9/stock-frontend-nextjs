"use client"

import type * as React from "react"
import { sidebarMenu } from "@/lib/config/sidebar-menu"
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar"
import { AppSidebarHeader } from "./sidebar-header"
import { SidebarNavigation } from "./sidebar-navigation"
import { AppSidebarFooter } from "./sidebar-footer"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <AppSidebarHeader />
      <SidebarContent>
        <SidebarNavigation items={sidebarMenu} />
      </SidebarContent>
      <AppSidebarFooter />
      <SidebarRail />
    </Sidebar>
  )
}
