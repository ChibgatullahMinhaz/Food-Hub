import { baseApi } from "@/store/api/base-api"
import type { ProviderStatus } from "@/types/api"
import type {
  ApplyProviderPayload,
  MyProviderProfileResponse,
  ProviderApplicationResponse,
  ProviderDetailResponse,
  ProviderListParams,
  ProviderListResponse,
} from "@/types/provider"

export const providerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    applyForProvider: builder.mutation<
      ProviderApplicationResponse,
      ApplyProviderPayload | FormData
    >({
      query: (body) => ({ url: "/prodivers/apply", method: "POST", body }),
      invalidatesTags: ["Provider"],
    }),
    getMyProviderProfile: builder.query<MyProviderProfileResponse, void>({
      query: () => "/prodivers/me",
      providesTags: ["Provider"],
    }),
    getProviderApplications: builder.query<
      ProviderListResponse,
      ProviderListParams
    >({
      query: (params) => ({
        url: "/prodivers/all/provider",
        params,
      }),
      providesTags: ["Provider"],
    }),
    updateProviderStatus: builder.mutation<
      ProviderApplicationResponse,
      { id: string; status: Extract<ProviderStatus, "APPROVED" | "REJECTED"> }
    >({
      query: ({ id, status }) => ({
        url: `/prodivers/${encodeURIComponent(id)}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Provider", "Profile", "User"],
    }),
    getProviderById: builder.query<ProviderDetailResponse, string>({
      query: (id) => `/prodivers/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: "Provider", id }],
    }),
  }),
})

export const {
  useApplyForProviderMutation,
  useGetMyProviderProfileQuery,
  useGetProviderApplicationsQuery,
  useLazyGetProviderApplicationsQuery,
  useUpdateProviderStatusMutation,
  useGetProviderByIdQuery,
} = providerApi
