"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  Menu,
  ShoppingBag,
  Store,
  Utensils,
  Users,
  X,
} from "lucide-react"

const navigationIcons = {
  "layout-dashboard": LayoutDashboard,
  "clipboard-list": ClipboardList,
  "folder-tree": FolderTree,
  "shopping-bag": ShoppingBag,
  store: Store,
  utensils: Utensils,
  users: Users,
} as const

export interface DashboardNavigationItem {
  href: string
  label: string
  icon: keyof typeof navigationIcons
  exact?: boolean
}

export function DashboardSidebarShell({
  homeHref,
  workspaceLabel,
  items,
  children,
}: {
  homeHref: string
  workspaceLabel: string
  items: DashboardNavigationItem[]
  children: ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function renderNavigation(mobile = false) {
    return (
      <nav aria-label={`${workspaceLabel} navigation`} className="space-y-1">
        {items.map(({ href, label, icon, exact }) => {
          const Icon = navigationIcons[icon]
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`)

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              href={href}
              key={href}
              onClick={() => {
                if (mobile) setMobileMenuOpen(false)
              }}
            >
              <Icon aria-hidden="true" className="size-[18px] shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 md:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-background md:flex">
        <div className="border-b px-5 py-5">
          <Link
            aria-label={`FoodHub ${workspaceLabel} overview`}
            className="text-xl font-bold tracking-tight text-primary"
            href={homeHref}
          >
            food<span className="text-orange-500">hub</span>
          </Link>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {workspaceLabel}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
          {renderNavigation()}
        </div>
        <div className="border-t p-4 text-xs text-muted-foreground">
          FoodHub
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:hidden">
          <Link
            className="text-lg font-bold tracking-tight text-primary"
            href={homeHref}
          >
            food<span className="text-orange-500">hub</span>
          </Link>
          <button
            aria-controls="dashboard-mobile-navigation"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center rounded-lg border text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => setMobileMenuOpen((open) => !open)}
            type="button"
          >
            {mobileMenuOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </header>
        {mobileMenuOpen && (
          <div
            className="fixed inset-x-0 top-14 z-20 border-b bg-background p-3 shadow-lg md:hidden"
            id="dashboard-mobile-navigation"
          >
            {renderNavigation(true)}
          </div>
        )}
        <main className="min-h-screen min-w-0">{children}</main>
      </div>
    </div>
  )
}
