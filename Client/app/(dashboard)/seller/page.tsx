import { RoleWorkspace } from "@/components/auth/role-workspace"
import Link from "next/link"

export default function SellerDashboardPage() {
  return (
    <RoleWorkspace
      role="PROVIDER"
      title="Seller workspace"
      description="Manage your incoming restaurant orders and fulfillment."
    >
      <Link
        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        href="/seller/orders"
      >
        Incoming orders
      </Link>
    </RoleWorkspace>
  )
}
