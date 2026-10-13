import { RoleWorkspace } from "@/components/auth/role-workspace"
import Link from "next/link"

export default function AdminDashboardPage() {
  return (
    <RoleWorkspace
      role="ADMIN"
      title="Admin workspace"
      description="Your account is ready. Review and manage FoodHub orders."
    >
      <Link
        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        href="/admin/orders"
      >
        Manage orders
      </Link>
      <Link
        className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium hover:bg-muted"
        href="/seller/orders"
      >
        Restaurant orders
      </Link>
    </RoleWorkspace>
  )
}
