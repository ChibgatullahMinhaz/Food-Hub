import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"
import { ProviderMenuManager } from "@/components/provider/provider-menu-manager"

export default function SellerMenuPage() {
  return (
    <DashboardWorkspace
      title="Menu management"
      description="Create and manage the meals shown on your restaurant menu."
    >
      <ProviderMenuManager />
    </DashboardWorkspace>
  )
}
