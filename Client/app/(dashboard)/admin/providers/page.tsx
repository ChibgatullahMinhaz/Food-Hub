import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"
import { ProviderApprovalPanel } from "@/components/provider/provider-approval-panel"

export default function AdminProvidersPage() {
  return (
    <DashboardWorkspace
      title="Provider applications"
      description="Review pending restaurant applications and provider status."
    >
      <ProviderApprovalPanel />
    </DashboardWorkspace>
  )
}
