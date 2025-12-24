"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { sidebarMenu } from "@/lib/config/sidebar-menu"

function getBreadcrumbPath(pathname: string) {
  const breadcrumbs: Array<{ path: string; label: string }> = []

  // Check if this is a child route and find its parent
  for (const item of sidebarMenu) {
    if (item.children) {
      const matchingChild = item.children.find((child) => child.path === pathname)
      if (matchingChild) {
        // Add parent first (without path since it's a collapsible group)
        breadcrumbs.push({ path: "", label: item.label })
        // Then add the child
        breadcrumbs.push({ path: pathname, label: matchingChild.label })
        return breadcrumbs
      }
    }
    // Check top-level items
    if (item.path === pathname) {
      breadcrumbs.push({ path: pathname, label: item.label })
      return breadcrumbs
    }
  }

  // Fallback: format the pathname segments
  const segments = pathname.split("/").filter(Boolean)
  return segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/")
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
    return { path, label }
  })
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbPath(pathname)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1
          const isParentGroup = crumb.path === ""

          return (
            <div key={crumb.path || crumb.label} className="flex items-center gap-2">
              <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : isParentGroup ? (
                  <span className="font-normal text-muted-foreground">{crumb.label}</span>
                ) : (
                  <BreadcrumbLink href={crumb.path}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : ""} />}
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
