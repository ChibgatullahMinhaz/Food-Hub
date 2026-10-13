import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"
import Link from "next/link"
import { ArrowRight, ClipboardList, Utensils } from "lucide-react"

export default function SellerDashboardPage() {
  return (
    <DashboardWorkspace
      title="Seller workspace"
      description="Overview of your restaurant workspace. Choose a module from the sidebar or below."
    >
      <Link
        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        href="/seller/menu"
      >
        <Utensils aria-hidden="true" className="mr-2 size-4" />
        Manage menu
      </Link>
      <Link
        className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium hover:bg-muted"
        href="/seller/orders"
      >
        <ClipboardList aria-hidden="true" className="mr-2 size-4" />
        Incoming orders
      </Link>
      <Link
        className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium hover:bg-muted"
        href="/shop"
      >
        <ArrowRight aria-hidden="true" className="mr-2 size-4" />
        View public menu
      </Link>
    </DashboardWorkspace>
  )
}
