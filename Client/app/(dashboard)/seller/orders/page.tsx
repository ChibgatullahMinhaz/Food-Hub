import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"
import { ProviderOrders } from "@/components/orders/order-views"

export default function SellerOrdersPage() {
  return (
    <DashboardWorkspace
      title="Incoming orders"
      description="Review customer orders for your restaurant and update fulfillment status."
    >
      <div className="w-full">
        <ProviderOrders />
      </div>
    </DashboardWorkspace>
  )
}
