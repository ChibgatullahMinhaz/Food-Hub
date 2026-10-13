import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"
import { AdminOrders } from "@/components/orders/order-views"

export default function AdminOrdersPage() {
  return (
    <DashboardWorkspace
      title="All orders"
      description="Review FoodHub orders and manage their status."
    >
      <AdminOrders />
    </DashboardWorkspace>
  )
}
