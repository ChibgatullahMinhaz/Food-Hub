"use client"

import type { ReactNode } from "react"
import { AccountNavigation } from "@/components/auth/auth-navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function DashboardWorkspace({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center gap-5 px-4 py-12 sm:px-6">
      <div className="flex w-full justify-end">
        <AccountNavigation />
      </div>
      <Card className="w-full">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            FoodHub workspace
          </p>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="flex flex-wrap gap-3">{children}</div>
        </CardContent>
      </Card>
    </div>
  )
}
