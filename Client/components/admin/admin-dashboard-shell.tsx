import {
  DashboardSidebarShell,
  type DashboardNavigationItem,
} from "@/components/dashboard/dashboard-sidebar-shell"

const adminModules: DashboardNavigationItem[] = [
  { href: "/admin", label: "Overview", icon: "layout-dashboard", exact: true },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/providers", label: "Provider applications", icon: "store" },
  { href: "/admin/categories", label: "Categories", icon: "folder-tree" },
  { href: "/admin/orders", label: "Orders", icon: "clipboard-list" },
]

export function AdminDashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardSidebarShell
      homeHref="/admin"
      items={adminModules}
      workspaceLabel="Admin console"
    >
      {children}
    </DashboardSidebarShell>
  )
}
