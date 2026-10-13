import { Suspense } from "react"
import { DashboardRouter } from "@/components/auth/auth-navigation"

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          Checking your FoodHub account...
        </div>
      }
    >
      <DashboardRouter />
    </Suspense>
  )
}
