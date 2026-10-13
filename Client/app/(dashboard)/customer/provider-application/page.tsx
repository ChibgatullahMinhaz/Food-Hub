import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"
import { ProviderApplicationPanel } from "@/components/provider/provider-application-panel"

export default function ProviderApplicationPage() {
  return (
    <DashboardWorkspace
      title="Become a provider"
      description="Apply to list your meals and manage orders on FoodHub."
    >
      <div className="w-full">
        <ProviderApplicationPanel />
      </div>
    </DashboardWorkspace>
  )
}
