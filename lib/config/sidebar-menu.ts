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
  Handshake,
  FileBarChart,
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
      { label: "Categories", icon: Package, path: "/master-data/categories", permission: "category:view" },
      { label: "Units", icon: Package, path: "/master-data/units", permission: "unit:view" },
      { label: "Brands", icon: Package, path: "/master-data/brands", permission: "brand:view" },
      { label: "Partners", icon: Users, path: "/master-data/partners", permission: "partner:view" },
      { label: "Attributes", icon: Package, path: "/master-data/attributes", permission: "attribute:view" },
      { label: "Attribute Sets", icon: Package, path: "/master-data/attribute-sets", permission: "attribute-set:view" },
      { label: "Products", icon: Package, path: "/master-data/products", permission: "product:view" },
      { label: "Payment Sources", icon: CreditCard, path: "/master-data/payment-sources", permission: "payment-source:view" },
    ],
  },
  {
    label: "Inventory",
    icon: Boxes,
    collapsible: true,
    id: "inventory",
    permission: null,
    children: [
      { label: "Warehouses", icon: Boxes, path: "/inventory/warehouses", permission: "warehouse:view" },
      { label: "Shops", icon: Package, path: "/inventory/shops", permission: "shop:view" },
      { label: "Stock Snapshot", icon: Boxes, path: "/inventory/stock", permission: "stock.snapshot:view" },
      { label: "Transfers", icon: ShoppingCart, path: "/inventory/transfers", permission: "stock.transfer:view" },
      { label: "Adjustments", icon: Package, path: "/inventory/adjustments", permission: "stock.adjustment:view" },
      { label: "Reservations", icon: Package, path: "/inventory/reservations", permission: "stock.reservation:view" },
      { label: "Transactions", icon: Package, path: "/inventory/transactions", permission: "stock.transaction:view" },
    ],
  },
 {
    label: "Purchase",
    icon: ShoppingCart,
    collapsible: true,
    id: "purchase",
    permission: null,
    children: [
      { label: "Shipments", icon: Truck, path: "/purchase/shipments", permission: "purchase-shipment:view" },
      { label: "Purchase Orders", icon: FileText, path: "/purchase/orders", permission: "purchase-order:view" },
      { label: "Expense Types", icon: Package, path: "/purchase/expense-types", permission: "purchase-expense-type:view" },
      { label: "Batches", icon: PackageCheck, path: "/purchase/batches", permission: "product-batch:view" },
    ],
  },
   {
    label: "Sales",
    icon: Receipt,
    collapsible: true,
    id: "sales",
    permission: null,
    children: [
      { label: "Sales Orders", icon: Receipt, path: "/sales/orders", permission: "sales-order:view" },
      { label: "Pricing Rules", icon: DollarSign, path: "/sales/pricing/rules", permission: "pricing-rule:view" },
      { label: "Price Quote", icon: Calculator, path: "/sales/pricing/quote", permission: "pricing-quote:view" },
    ],
  },
  {
    label: "Agent Sales",
    icon: Handshake,
    collapsible: true,
    id: "agent-sales",
    permission: null,
    children: [
      { label: "Agent Sales", icon: Receipt, path: "/agent-sales", permission: "agent-sale:view" },
      { label: "Commission Rules",icon: Percent, path: "/agent-sales/commission-rules", permission: "commission-rule:view" },
    ],
  },
  {
    label: "Finance",
    icon: Banknote,
    collapsible: true,
    id: "finance",
    permission: null,
    children: [
      { label: "Customer Invoices", icon: FileText, path: "/finance/invoices", permission: "invoice:view" },
      { label: "Accounts Receivable", icon: CreditCard, path: "/finance/receivables", permission: "receivable:view" },
      { label: "Accounts Payable", icon: DollarSign, path: "/finance/payables", permission: "payable:view" },
      { label: "Tax Configuration", icon: Percent, path: "/finance/tax", permission: "tax-config:view" },
      { label: "Profit & Loss", icon: TrendingUp, path: "/finance/costing", permission: "costing:view" },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    path: "#",
    permission: null,
  },
  // {
  //   label: "Reports",
  //   icon: FileText,
  //   path: "#",
  //   permission: null,
  // },
   {
    label: "Reports",
    icon: FileBarChart,
    collapsible: true,
    id: "reports",
    permission: null,
    children: [
      {
        label: "Reports Dashboard",
        icon: FileBarChart,
        path: "/reports",
        permission: null,
      },
      {
        label: "Inventory Dashboard",
        icon: Boxes,
        path: "/reports/inventory",
        permission: null,
      },
      // {
      //   label: "Inventory Reports",
      //   icon: Boxes,
      //   collapsible: true,
      //   id: "inventory-reports",
      //   permission: null,
      //   children: [
      //     {
      //       label: "Stock Position",
      //       icon: Package,
      //       path: "/reports/inventory/stock-position",
      //       permission: null,
      //     },
      //     {
      //       label: "Movement",
      //       icon: TrendingUp,
      //       path: "/reports/inventory/movement",
      //       permission: null,
      //     },
      //   ],
      // },
      {
        label: "Sales Dashboard",
        icon: ShoppingCart,
        path: "/reports/sales",
        permission: null,
      },
      // {
      //   label: "Sales Reports",
      //   icon: ShoppingCart,
      //   collapsible: true,
      //   id: "sales-reports",
      //   permission: null,
      //   children: [
      //     {
      //       label: "Sales Summary",
      //       icon: Receipt,
      //       path: "/reports/sales/summary",
      //       permission: null,
      //     },
      //     {
      //       label: "Pricing Governance",
      //       icon: DollarSign,
      //       path: "/reports/sales/pricing-governance",
      //       permission: null,
      //     },
      //     {
      //       label: "Fulfillment",
      //       icon: Truck,
      //       path: "/reports/sales/fulfillment",
      //       permission: null,
      //     },
      //   ],
      // },
      {
        label: "Finance Dashboard",
        icon: Banknote,
        path: "/reports/finance",
        permission: null,
      },
      // {
      //   label: "Finance Reports",
      //   icon: Banknote,
      //   collapsible: true,
      //   id: "finance-reports",
      //   permission: null,
      //   children: [
      //     {
      //       label: "Receivables",
      //       icon: CreditCard,
      //       path: "/reports/finance/receivables",
      //       permission: null,
      //     },
      //     {
      //       label: "Payables",
      //       icon: DollarSign,
      //       path: "/reports/finance/payables",
      //       permission: null,
      //     },
      //     {
      //       label: "Cash Flow",
      //       icon: TrendingUp,
      //       path: "/reports/finance/cashflow",
      //       permission: null,
      //     },
      //     {
      //       label: "Profitability",
      //       icon: TrendingUp,
      //       path: "/reports/finance/profitability",
      //       permission: null,
      //     },
      //   ],
      // },
      {
        label: "Agent Dashboard",
        icon: Handshake,
        path: "/reports/agent",
        permission: null,
      },
      // {
      //   label: "Agent Reports",
      //   icon: Handshake,
      //   collapsible: true,
      //   id: "agent-reports",
      //   permission: null,
      //   children: [
      //     {
      //       label: "Performance",
      //       icon: TrendingUp,
      //       path: "/reports/agent/performance",
      //       permission: null,
      //     },
      //     {
      //       label: "Settlements",
      //       icon: Receipt,
      //       path: "/reports/agent/settlements",
      //       permission: null,
      //     },
      //   ],
      // },
    ],
  },


  // {
  //   label: "Reports",
  //   icon: FileBarChart,
  //   collapsible: true,
  //   id: "reports",
  //   permission: "report:view",
  //   children: [
  //     {
  //       label: "Reports Dashboard",
  //       icon: FileBarChart,
  //       path: "/reports",
  //       permission: "report:view",
  //     },
  //     {
  //       label: "Inventory Dashboard",
  //       icon: Boxes,
  //       path: "/reports/inventory",
  //       permission: "report.inventory.view",
  //     },
  //     {
  //       label: "Inventory Reports",
  //       icon: Boxes,
  //       collapsible: true,
  //       permission: "report.inventory.view",
  //       children: [
  //         {
  //           label: "Stock Position",
  //           icon: Package,
  //           path: "/reports/inventory/stock-position",
  //           permission: "report.inventory.view",
  //         },
  //         {
  //           label: "Movement",
  //           icon: TrendingUp,
  //           path: "/reports/inventory/movement",
  //           permission: "report.inventory.view",
  //         },
  //       ],
  //     },
  //     {
  //       label: "Sales Dashboard",
  //       icon: ShoppingCart,
  //       path: "/reports/sales",
  //       permission: "report.sales.view",
  //     },
  //     {
  //       label: "Sales Reports",
  //       icon: ShoppingCart,
  //       collapsible: true,
  //       permission: "report.sales.view",
  //       children: [
  //         {
  //           label: "Sales Summary",
  //           icon: Receipt,
  //           path: "/reports/sales/summary",
  //           permission: "report.sales.view",
  //         },
  //         {
  //           label: "Pricing Governance",
  //           icon: DollarSign,
  //           path: "/reports/sales/pricing-governance",
  //           permission: "report.sales.view",
  //         },
  //         {
  //           label: "Fulfillment",
  //           icon: Truck,
  //           path: "/reports/sales/fulfillment",
  //           permission: "report.sales.view",
  //         },
  //       ],
  //     },
  //     {
  //       label: "Finance Dashboard",
  //       icon: Banknote,
  //       path: "/reports/finance",
  //       permission: "report.finance.view",
  //     },
  //     {
  //       label: "Finance Reports",
  //       icon: Banknote,
  //       collapsible: true,
  //       permission: "report.finance.view",
  //       children: [
  //         {
  //           label: "Receivables",
  //           icon: CreditCard,
  //           path: "/reports/finance/receivables",
  //           permission: "report.finance.view",
  //         },
  //         {
  //           label: "Payables",
  //           icon: DollarSign,
  //           path: "/reports/finance/payables",
  //           permission: "report.finance.view",
  //         },
  //         {
  //           label: "Cash Flow",
  //           icon: TrendingUp,
  //           path: "/reports/finance/cashflow",
  //           permission: "report.finance.view",
  //         },
  //         {
  //           label: "Profitability",
  //           icon: TrendingUp,
  //           path: "/reports/finance/profitability",
  //           permission: "report.finance.view",
  //         },
  //       ],
  //     },
  //     {
  //       label: "Agent Dashboard",
  //       icon: Handshake,
  //       path: "/reports/agent",
  //       permission: "report.agent.view",
  //     },
  //     {
  //       label: "Agent Reports",
  //       icon: Handshake,
  //       collapsible: true,
  //       permission: "report.agent.view",
  //       children: [
  //         {
  //           label: "Performance",
  //           icon: TrendingUp,
  //           path: "/reports/agent/performance",
  //           permission: "report.agent.view",
  //         },
  //         {
  //           label: "Settlements",
  //           icon: Receipt,
  //           path: "/reports/agent/settlements",
  //           permission: "report.agent.view",
  //         },
  //       ],
  //     },
  //   ],
  // },
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

// export function getSectionConfigs(): SectionConfig[] {
//   const configs: SectionConfig[] = []

//   sidebarMenu.forEach((item) => {
//     if (item.collapsible && item.id && item.children) {
//       // Extract all child routes for this section
//       const routes = item.children.map((child) => child.path).filter((path): path is string => path !== undefined)

//       configs.push({
//         id: item.id,
//         routes,
//       })
//     }
//   })

//   return configs
// }

function collectRoutes(items: MenuItem[]): string[] {
  return items.flatMap((item) => {
    const ownRoute = item.path ? [item.path] : []
    const childRoutes = item.children ? collectRoutes(item.children) : []
    return [...ownRoute, ...childRoutes]
  })
}

export function getSectionConfigs(): SectionConfig[] {
  const configs: SectionConfig[] = []

  sidebarMenu.forEach((item) => {
    if (item.collapsible && item.id && item.children) {
      configs.push({
        id: item.id,
        routes: collectRoutes(item.children),
      })
    }
  })

  return configs
}
