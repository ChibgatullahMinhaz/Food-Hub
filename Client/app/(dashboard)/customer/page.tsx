import { RoleWorkspace } from "@/components/auth/role-workspace"
import Link from "next/link"

export default function CustomerDashboardPage() {
  return (
    <RoleWorkspace
      role="CUSTOMER"
      title="Welcome to your FoodHub"
      description="Your account is ready. Track orders, browse meals, or manage your cart."
    >
      <Link
        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        href="/orders"
      >
        My orders
      </Link>
      <Link
        className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium hover:bg-muted"
        href="/cart"
      >
        View cart
      </Link>
    </RoleWorkspace>
  )
}
