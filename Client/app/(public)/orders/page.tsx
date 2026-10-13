import Link from "next/link"
import { CustomerOrders } from "@/components/orders/order-views"

export default function OrdersPage() {
  return (
    <main className="public-browse-page min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link className="text-xl font-bold tracking-tight text-primary" href="/">
            food<span className="text-orange-500">hub</span>
          </Link>
          <nav aria-label="Food navigation" className="flex items-center gap-5 text-sm">
            <Link className="text-muted-foreground hover:text-foreground" href="/shop">
              Browse meals
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/cart">
              Cart
            </Link>
            <Link className="font-medium text-primary" href="/orders">
              Orders
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Your FoodHub account
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Order history
          </h1>
        </div>
        <CustomerOrders />
      </div>
    </main>
  )
}
