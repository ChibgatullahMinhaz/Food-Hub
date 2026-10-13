import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"
import { OrderDetailView } from "@/components/orders/order-views"

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <DashboardWorkspace
      title="Order details"
      description="Track your order and review its items."
    >
      <div className="w-full">
        <OrderDetailView audience="customer" id={id} />
      </div>
    </DashboardWorkspace>
  )
}
