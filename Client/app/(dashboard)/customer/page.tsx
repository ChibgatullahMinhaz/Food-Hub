import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"
import Link from "next/link"
import {
  ArrowRight,
  ClipboardList,
  ShoppingBag,
  Store,
} from "lucide-react"

export default function CustomerDashboardPage() {
  return (
    <DashboardWorkspace
      title="Welcome to your FoodHub"
      description="Welcome back. Browse meals and manage your FoodHub account from one place."
    >
      <Link
        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        href="/customer/orders"
      >
        <ClipboardList aria-hidden="true" className="mr-2 size-4" />
        My orders
      </Link>
      <Link
        className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium hover:bg-muted"
        href="/customer/cart"
      >
        <ShoppingBag aria-hidden="true" className="mr-2 size-4" />
        View cart
      </Link>
      <Link
        className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium hover:bg-muted"
        href="/customer/provider-application"
      >
        <Store aria-hidden="true" className="mr-2 size-4" />
        Provider application
      </Link>
      <Link
        className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium hover:bg-muted"
        href="/shop"
      >
        <ArrowRight aria-hidden="true" className="mr-2 size-4" />
        Browse meals
      </Link>
    </DashboardWorkspace>
  )
}
