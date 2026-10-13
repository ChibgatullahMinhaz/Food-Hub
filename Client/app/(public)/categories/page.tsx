import Link from "next/link"
import { CategoryDirectory } from "@/components/browsing/public-browsing"

export default function CategoriesPage() {
  return (
    <main className="public-browse-page min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link className="text-xl font-bold tracking-tight text-primary" href="/">
            food<span className="text-orange-500">hub</span>
          </Link>
          <nav aria-label="Food navigation" className="flex items-center gap-5 text-sm">
            <Link className="text-sm font-medium text-muted-foreground hover:text-foreground" href="/shop">
              Browse meals
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/cart">
              Cart
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Explore by craving
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Browse food categories
          </h1>
          <p className="leading-7 text-muted-foreground">
            Pick a category and discover available meals prepared by local
            restaurants.
          </p>
        </div>
        <CategoryDirectory />
      </div>
    </main>
  )
}
