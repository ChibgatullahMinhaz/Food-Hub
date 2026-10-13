import type { Role } from "@/types/api"

export const dashboardPathByRole: Record<Role, string> = {
  CUSTOMER: "/customer",
  PROVIDER: "/seller",
  ADMIN: "/admin",
}
