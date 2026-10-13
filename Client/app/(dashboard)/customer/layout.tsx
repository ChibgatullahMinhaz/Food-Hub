import type { ReactNode } from "react"
import {
  DashboardSidebarShell,
  type DashboardNavigationItem,
} from "@/components/dashboard/dashboard-sidebar-shell"

const customerModules: DashboardNavigationItem[] = [
  {
    href: "/customer",
    label: "Overview",
    icon: "layout-dashboard",
    exact: true,
  },
  { href: "/customer/orders", label: "My orders", icon: "clipboard-list" },
  { href: "/customer/cart", label: "My cart", icon: "shopping-bag" },
  {
    href: "/customer/provider-application",
    label: "Become a provider",
    icon: "store",
  },
]

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardSidebarShell
      homeHref="/customer"
      items={customerModules}
      workspaceLabel="Customer workspace"
    >
      {children}
    </DashboardSidebarShell>
  )
}
