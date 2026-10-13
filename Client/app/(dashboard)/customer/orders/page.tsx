import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"
import { CustomerOrders } from "@/components/orders/order-views"

export default function CustomerOrdersPage() {
  return (
    <DashboardWorkspace
      title="My orders"
      description="Review your order history and track current orders."
    >
      <div className="w-full">
        <CustomerOrders />
      </div>
    </DashboardWorkspace>
  )
}
