export interface CursorMeta {
  limit: number
  nextCursor?: string | null
  prevCursor?: string | null
  hasMore: boolean
  totalCount?: number
}

export interface ApiResponse<T, M = CursorMeta> {
  statusCode: number
  success: boolean
  message?: string
  meta?: M
  data: T
}

export interface ApiErrorBody {
  success: false
  message: string
  errorSources: Array<{ path: string | number; message: string }>
}

export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN"
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BLOCKED"
export type ProviderStatus = "PENDING" | "APPROVED" | "REJECTED"
export type UserProfile = {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  createdAt: string
  updatedAt: string
}
export interface AdminUser extends UserProfile {
  phone: string | null
  emailVerified: boolean
  image: string | null
  providerProfile: {
    id: string
    restaurantName: string
    status: ProviderStatus
  } | null
  _count: { orders: number }
}
export type OrderStatus =
  | "PLACED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED"
