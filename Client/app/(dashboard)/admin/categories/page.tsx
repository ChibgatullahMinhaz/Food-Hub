import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"
import { AdminCategoriesPanel } from "@/components/admin/admin-categories-panel"

export default function AdminCategoriesPage() {
  return (
    <DashboardWorkspace
      title="Category management"
      description="Create and maintain the categories used to organize FoodHub meals."
    >
      <AdminCategoriesPanel />
    </DashboardWorkspace>
  )
}
