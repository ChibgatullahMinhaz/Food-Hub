import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"
import { AdminUsersPanel } from "@/components/admin/admin-users-panel"

export default function AdminUsersPage() {
  return (
    <DashboardWorkspace
      title="User management"
      description="Manage FoodHub customer, provider, and administrator accounts."
    >
      <AdminUsersPanel />
    </DashboardWorkspace>
  )
}
