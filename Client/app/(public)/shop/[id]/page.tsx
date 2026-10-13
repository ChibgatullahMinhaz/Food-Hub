import Link from "next/link"
import { MealDetailView } from "@/components/browsing/public-browsing"

export default async function MealPage({
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
          <nav aria-label="Food navigation" className="flex items-center gap-5 text-sm">
            <Link className="font-medium text-muted-foreground hover:text-foreground" href="/shop">
              Browse meals
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/cart">
              Cart
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <MealDetailView id={id} key={id} />
      </div>
    </main>
  )
}
