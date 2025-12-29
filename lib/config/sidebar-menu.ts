import {
  LayoutDashboard,
  Shield,
  Users,
  KeyRound,
  Settings,
  FileText,
  BarChart3,
  HelpCircle,
  type LucideIcon,
  Package,
  CreditCard,
  Boxes,
  ShoppingCart,
  Truck,
  PackageCheck,
  Receipt,
  Banknote,
  Calculator,
  DollarSign,
  Percent,
  TrendingUp,
} from "lucide-react"

export interface MenuItem {
  label: string
  icon: LucideIcon
  path?: string
  permission?: string | null
  collapsible?: boolean
  id?: string
  children?: MenuItem[]
}

export const sidebarMenu: MenuItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    permission: null,
  },
  {
    label: "Access Control",
    icon: Shield,
    collapsible: true,
    id: "access-control",
    permission: null,
    children: [
      { 
        label: "Users",
        icon: Users,
        path: "/users",
        permission: "user:view",
      },
      {
        label: "Roles",
        icon: KeyRound,
        path: "/roles",
        permission: "role:view",
      },
      {
        label: "Permissions",
        icon: KeyRound,
        path: "/permissions",
        permission: "permission:view",
      },
    ],
  },
  {
    label: "Master Data",
    icon: Package,
    collapsible: true,
    id: "master-data",
    permission: null,
    children: [
      { label: "Categories", icon: Package, path: "/master-data/categories", permission: null },
      { label: "Units", icon: Package, path: "/master-data/units", permission: null },
      { label: "Brands", icon: Package, path: "/master-data/brands", permission: null },
      { label: "Partners", icon: Users, path: "/master-data/partners", permission: null },
      { label: "Attributes", icon: Package, path: "/master-data/attributes", permission: null },
      { label: "Attribute Sets", icon: Package, path: "/master-data/attribute-sets", permission: null },
      { label: "Products", icon: Package, path: "/master-data/products", permission: null },
      {label: "Payment Sources", icon: CreditCard, path: "/master-data/payment-sources", permission: null },
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
    //   { label: "Payment Sources", icon: CreditCard, path: "/master-data/payment-sources", permission: "payment-source:view" },
    // ],
  },
  {
    label: "Inventory",
    icon: Boxes,
    collapsible: true,
    id: "inventory",
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
  //   id: "inventory",
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
    label: "Purchase",
    icon: ShoppingCart,
    collapsible: true,
    id: "purchase",
    permission: null,
    children: [
      { label: "Shipments", icon: Truck, path: "/purchase/shipments", permission: null },
      { label: "Purchase Orders", icon: FileText, path: "/purchase/orders", permission: null },
      { label: "Expense Types", icon: Package, path: "/purchase/expense-types", permission: null },
      { label: "Batches", icon: PackageCheck, path: "/purchase/batches", permission: null },
    ],
  },
//  {
//     label: "Purchase",
//     icon: ShoppingCart,
//     collapsible: true,
//     id: "purchase",
//     permission: "purchase:view",
//     children: [
//       { label: "Shipments", icon: Truck, path: "/purchase/shipments", permission: "shipment:view" },
//       { label: "Purchase Orders", icon: FileText, path: "/purchase/orders", permission: "purchase-order:view" },
//       { label: "Expense Types", icon: Package, path: "/purchase/expense-types", permission: "expense-type:view" },
//       { label: "Batches", icon: PackageCheck, path: "/purchase/batches", permission: "batch:view" },
//     ],
//   },
 {
    label: "Sales",
    icon: Receipt,
    collapsible: true,
    id: "sales",
    permission: null,
    children: [
      { label: "Sales Orders", icon: Receipt, path: "/sales/orders", permission: null },
      { label: "Pricing Rules", icon: Banknote, path: "/sales/pricing/rules", permission: null },
      { label: "Price Quote", icon: Calculator, path: "/sales/pricing/quote", permission: null },
    ],
  },
  //  {
  //   label: "Sales",
  //   icon: Receipt,
  //   collapsible: true,
  //   id: "sales",
  //   permission: "sales:view",
  //   children: [
  //     { label: "Sales Orders", icon: Receipt, path: "/sales/orders", permission: "sales-order:view" },
  //     { label: "Pricing Rules", icon: DollarSign, path: "/sales/pricing/rules", permission: "pricing:view" },
  //     { label: "Price Quote", icon: Calculator, path: "/sales/pricing/quote", permission: "pricing:view" },
  //   ],
  // },

   {
    label: "Finance",
    icon: Banknote,
    collapsible: true,
    id: "finance",
    permission: null,
    children: [
      { label: "Customer Invoices", icon: FileText, path: "/finance/invoices", permission: null },
      { label: "Accounts Receivable", icon: CreditCard, path: "/finance/receivables", permission: null },
      { label: "Accounts Payable", icon: DollarSign, path: "/finance/payables", permission: null },
      { label: "Tax Configuration", icon: Percent, path: "/finance/tax", permission: null  },
      { label: "Profit & Loss", icon: TrendingUp, path: "/finance/costing", permission: null },
    ],
  },
  // {
  //   label: "Finance",
  //   icon: Banknote,
  //   collapsible: true,
  //   id: "finance",
  //   permission: "finance:view",
  //   children: [
  //     { label: "Customer Invoices", icon: FileText, path: "/finance/invoices", permission: "invoice:view" },
  //     { label: "Accounts Receivable", icon: CreditCard, path: "/finance/receivables", permission: "receivable:view" },
  //     { label: "Accounts Payable", icon: DollarSign, path: "/finance/payables", permission: "payable:view" },
  //     { label: "Tax Configuration", icon: Percent, path: "/finance/tax", permission: "tax:view" },
  //     { label: "Profit & Loss", icon: TrendingUp, path: "/finance/costing", permission: "costing:view" },
  //   ],
  // },
  {
    label: "Analytics",
    icon: BarChart3,
    path: "#",
    permission: null,
  },
  {
    label: "Reports",
    icon: FileText,
    path: "#",
    permission: null,
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/profile",
    permission: null,
  },
  {
    label: "Help",
    icon: HelpCircle,
    path: "#",
    permission: null, // Public access
  },
]

export interface SectionConfig {
  id: string
  routes: string[]
}

export function getSectionConfigs(): SectionConfig[] {
  const configs: SectionConfig[] = []

  sidebarMenu.forEach((item) => {
    if (item.collapsible && item.id && item.children) {
      // Extract all child routes for this section
      const routes = item.children.map((child) => child.path).filter((path): path is string => path !== undefined)

      configs.push({
        id: item.id,
        routes,
      })
    }
  })

  return configs
}
