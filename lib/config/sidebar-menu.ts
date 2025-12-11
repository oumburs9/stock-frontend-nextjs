import { Home, Shield, Users, KeyRound, Package, ShoppingCart, Boxes } from "lucide-react"

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
    permission: null,
    children: [
      { label: "Users", icon: Users, path: "/users", permission: null },
      { label: "Roles", icon: KeyRound, path: "/roles", permission: null},
      { label: "Permissions", icon: KeyRound, path: "/permissions", permission: null },
    // permission: "access-control:view",
    // children: [
    //   { label: "Users", icon: Users, path: "/users", permission: "user:view" },
    //   { label: "Roles", icon: KeyRound, path: "/roles", permission: "role:view" },
    //   { label: "Permissions", icon: KeyRound, path: "/permissions", permission: "permission:view" },
    ],
  },
   {
    label: "Master Data",
    icon: Package,
    collapsible: true,
    permission: null,
    children: [
      { label: "Categories", icon: Package, path: "/master-data/categories", permission: null },
      { label: "Units", icon: Package, path: "/master-data/units", permission: null },
      { label: "Brands", icon: Package, path: "/master-data/brands", permission: null },
      { label: "Partners", icon: Users, path: "/master-data/partners", permission: null },
      { label: "Attributes", icon: Package, path: "/master-data/attributes", permission: null },
      { label: "Attribute Sets", icon: Package, path: "/master-data/attribute-sets", permission: null },
      { label: "Products", icon: Package, path: "/master-data/products", permission: null },
    ],
    // permission: "master-data:view",
    // children: [
    //   { label: "Categories", icon: Package, path: "/master-data/categories", permission: "category:view" },
    //   { label: "Units", icon: Package, path: "/master-data/units", permission: "unit:view" },
    //   { label: "Brands", icon: Package, path: "/master-data/brands", permission: "brand:view" },
    //   { label: "Partners", icon: Users, path: "/master-data/partners", permission: "partner:view" },
    //   { label: "Attributes", icon: Package, path: "/master-data/attributes", permission: "attribute:view" },
    //   { label: "Attribute Sets", icon: Package, path: "/master-data/attribute-sets", permission: "attribute-set:view" },
    //   { label: "Products", icon: Package, path: "/master-data/products", permission: "product:view" },
    // ],
  },
  {
    label: "Inventory",
    icon: Boxes,
    collapsible: true,
    permission: null,
    children: [
      { label: "Warehouses", icon: Boxes, path: "/inventory/warehouses", permission: null },
      { label: "Shops", icon: Package, path: "/inventory/shops", permission: null },
      { label: "Stock Snapshot", icon: Boxes, path: "/inventory/stock", permission: null },
      { label: "Transfers", icon: ShoppingCart, path: "/inventory/transfers", permission: null },
      { label: "Adjustments", icon: Package, path: "/inventory/adjustments", permission: null },
      { label: "Reservations", icon: Package, path: "/inventory/reservations", permission: null },
      { label: "Transactions", icon: Package, path: "/inventory/transactions", permission: null },
    ],
  },
  // {
  //   label: "Inventory",
  //   icon: Boxes,
  //   collapsible: true,
  //   permission: "inventory:view",
  //   children: [
  //     { label: "Warehouses", icon: Boxes, path: "/inventory/warehouses", permission: "warehouse:view" },
  //     { label: "Shops", icon: Package, path: "/inventory/shops", permission: "shop:view" },
  //     { label: "Stock Snapshot", icon: Boxes, path: "/inventory/stock", permission: "stock:view" },
  //     { label: "Transfers", icon: ShoppingCart, path: "/inventory/transfers", permission: "stock.transfer" },
  //     { label: "Adjustments", icon: Package, path: "/inventory/adjustments", permission: "stock.adjust" },
  //     { label: "Reservations", icon: Package, path: "/inventory/reservations", permission: "stock.reserve" },
  //     { label: "Transactions", icon: Package, path: "/inventory/transactions", permission: "stock.transactions" },
  //   ],
  // },
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
