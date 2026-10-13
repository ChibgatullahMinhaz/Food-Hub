import type { ReactNode } from "react"
import {
  DashboardSidebarShell,
  type DashboardNavigationItem,
} from "@/components/dashboard/dashboard-sidebar-shell"

const sellerModules: DashboardNavigationItem[] = [
  { href: "/seller", label: "Overview", icon: "layout-dashboard", exact: true },
  { href: "/seller/menu", label: "Menu management", icon: "utensils" },
  { href: "/seller/orders", label: "Incoming orders", icon: "clipboard-list" },
]

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardSidebarShell
      homeHref="/seller"
      items={sellerModules}
      workspaceLabel="Provider workspace"
    >
      {children}
    </DashboardSidebarShell>
  )
}
