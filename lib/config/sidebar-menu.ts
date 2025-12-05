import { Home, Shield, Users, KeyRound, Package, ShoppingCart } from "lucide-react"

export interface MenuItem {
  label: string
  icon: typeof Home
  path?: string
  permission?: string | null
  collapsible?: boolean
  children?: MenuItem[]
}

export const sidebarMenu: MenuItem[] = [
  {
    label: "Dashboard",
    icon: Home,
    path: "/dashboard",
    permission: null,
  },
  {
    label: "Access Control",
    icon: Shield,
    collapsible: true,
    permission: "access-control:view",
    children: [
      { label: "Users", icon: Users, path: "/users", permission: "user:view" },
      { label: "Roles", icon: KeyRound, path: "/roles", permission: "role:view" },
      { label: "Permissions", icon: KeyRound, path: "/permissions", permission: "permission:view" },
    ],
  },
  {
    label: "Stock",
    icon: Package,
    collapsible: true,
    permission: "stock:view",
    children: [],
  },
  {
    label: "Purchase",
    icon: ShoppingCart,
    collapsible: true,
    permission: "purchase:view",
    children: [],
  },
]
