import { baseApi } from "@/store/api/base-api"
import type { ApiResponse, AdminUser, CursorMeta, Role, UserStatus } from "@/types/api"

export interface AdminUserListParams {
  cursor?: string
  limit: number
  search?: string
  role?: Role
  status?: UserStatus
}

export interface AdminUserDetails {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  createdAt: string
  updatedAt: string
  orders: Array<{
    id: string
    totalAmount: number | string
    status: string
    createdAt: string
  }>
  _count: { orders: number }
}

export type AdminUserListResponse = ApiResponse<AdminUser[], CursorMeta>
export type AdminUserDetailsResponse = ApiResponse<AdminUserDetails>
export type AdminUserMutationResponse = ApiResponse<
  Pick<AdminUser, "id" | "name" | "email" | "role" | "status" | "updatedAt">
>
export type AdminUserDeleteResponse = ApiResponse<{ message: string }>

export const adminUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<AdminUserListResponse, AdminUserListParams>({
      query: (params) => ({ url: "/admin/users", params }),
      providesTags: ["User"],
    }),
    getAdminUserDetails: builder.query<AdminUserDetailsResponse, string>({
      query: (id) => `/admin/users/${encodeURIComponent(id)}/details`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),
    updateAdminUser: builder.mutation<
      AdminUserMutationResponse,
      {
        id: string
        body: { name?: string; role?: Role; status?: UserStatus }
      }
    >({
      query: ({ id, body }) => ({
        url: `/admin/users/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User", "Profile", "Provider"],
    }),
    deleteAdminUser: builder.mutation<AdminUserDeleteResponse, string>({
      query: (id) => ({
        url: `/admin/users/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User", "Profile", "Provider"],
    }),
  }),
})

export const {
  useGetAdminUsersQuery,
  useLazyGetAdminUsersQuery,
  useGetAdminUserDetailsQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
} = adminUserApi
