import Link from "next/link"
import { ProviderOrders } from "@/components/orders/order-views"

export default function SellerOrdersPage() {
  return (
    <main className="public-browse-page min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link className="text-xl font-bold tracking-tight text-primary" href="/">
            food<span className="text-orange-500">hub</span>
          </Link>
          <Link
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            href="/seller"
          >
            Seller workspace
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Restaurant workspace
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Incoming orders
          </h1>
        </div>
        <ProviderOrders />
      </div>
    </main>
  )
}
