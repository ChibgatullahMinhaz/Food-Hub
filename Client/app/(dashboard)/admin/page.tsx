import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"
import Link from "next/link"
import { ArrowRight, ClipboardList, FolderTree, Store, Users } from "lucide-react"
import type { ReactNode } from "react"

export default function AdminDashboardPage() {
  return (
    <DashboardWorkspace
      title="Overview"
      description="Welcome to FoodHub operations. Choose a module from the sidebar or open a workspace below."
    >
      <nav
        aria-label="Admin overview shortcuts"
        className="grid w-full gap-3 sm:grid-cols-2"
      >
        <ModuleLink
          description="Review applications and approve or reject providers."
          href="/admin/providers"
          icon={<Store aria-hidden="true" className="size-5" />}
          title="Provider applications"
        />
        <ModuleLink
          description="Search accounts, inspect orders, and update account access."
          href="/admin/users"
          icon={<Users aria-hidden="true" className="size-5" />}
          title="User management"
        />
        <ModuleLink
          description="Create, edit, and manage food categories."
          href="/admin/categories"
          icon={<FolderTree aria-hidden="true" className="size-5" />}
          title="Categories"
        />
        <ModuleLink
          description="Review all orders and manage their status."
          href="/admin/orders"
          icon={<ClipboardList aria-hidden="true" className="size-5" />}
          title="Orders"
        />
      </nav>
    </DashboardWorkspace>
  )
}

function ModuleLink({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <Link
      className="group flex items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/60"
      href={href}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2 font-semibold">
          {title}
          <ArrowRight
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          />
        </span>
        <span className="mt-1 block text-sm font-normal text-muted-foreground">
          {description}
        </span>
      </span>
    </Link>
  )
}
