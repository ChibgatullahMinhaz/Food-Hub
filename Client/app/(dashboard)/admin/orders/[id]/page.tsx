import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"
import { OrderDetailView } from "@/components/orders/order-views"

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <DashboardWorkspace
      title="Order details"
      description="Review this order and manage its status."
    >
      <OrderDetailView audience="admin" id={id} />
    </DashboardWorkspace>
  )
}
