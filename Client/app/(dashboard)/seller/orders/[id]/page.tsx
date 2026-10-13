import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"
import { OrderDetailView } from "@/components/orders/order-views"

export default async function SellerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <DashboardWorkspace
      title="Order details"
      description="Review order items and update the fulfillment status."
    >
      <div className="w-full">
        <OrderDetailView audience="provider" id={id} />
      </div>
    </DashboardWorkspace>
  )
}
