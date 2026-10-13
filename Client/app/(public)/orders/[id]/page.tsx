import Link from "next/link"
import { OrderDetailView } from "@/components/orders/order-views"

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <main className="public-browse-page min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link className="text-xl font-bold tracking-tight text-primary" href="/">
            food<span className="text-orange-500">hub</span>
          </Link>
          <Link
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            href="/orders"
          >
            Order history
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <OrderDetailView audience="customer" id={id} />
      </div>
    </main>
  )
}
