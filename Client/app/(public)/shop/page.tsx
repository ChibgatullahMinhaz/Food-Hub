"use client"

import { Suspense } from "react"
import Link from "next/link"
import { ShopBrowser } from "@/components/browsing/public-browsing"

function ShopPageContent() {
  return (
    <main className="public-browse-page min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link className="text-xl font-bold tracking-tight text-primary" href="/">
            food<span className="text-orange-500">hub</span>
          </Link>
          <nav aria-label="Food navigation" className="flex items-center gap-5 text-sm">
            <Link className="font-medium text-primary" href="/shop">
              Meals
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/categories">
              Categories
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
            Made fresh, picked for you
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Find your next favourite meal
          </h1>
          <p className="leading-7 text-muted-foreground">
            Explore the menu from local kitchens and find something delicious
            for today.
          </p>
        </div>
        <ShopBrowser />
      </div>
    </main>
  )
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <main className="public-browse-page min-h-screen bg-background">
          <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-14 sm:px-6">
            <div className="h-9 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-28 animate-pulse rounded-2xl bg-muted" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" key={index} />
              ))}
            </div>
          </div>
        </main>
      }
    >
      <ShopPageContent />
    </Suspense>
  )
}
