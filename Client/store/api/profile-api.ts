import { baseApi } from "@/store/api/base-api"
import type { ApiResponse, UserProfile } from "@/types/api"

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentProfile: builder.query<ApiResponse<UserProfile>, void>({
      query: () => "/admin/users/current/profile",
      providesTags: ["Profile"],
    }),
  }),
})

export const { useGetCurrentProfileQuery, useLazyGetCurrentProfileQuery } =
  profileApi
