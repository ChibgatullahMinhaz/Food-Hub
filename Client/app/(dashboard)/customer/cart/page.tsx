import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"
import { CustomerCart } from "@/components/cart/customer-cart"

export default function CustomerCartPage() {
  return (
    <DashboardWorkspace
      title="My cart"
      description="Review your selection and continue to checkout."
    >
      <div className="w-full">
        <CustomerCart />
      </div>
    </DashboardWorkspace>
  )
}
