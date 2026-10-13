import { baseApi } from "@/store/api/base-api"
import type { ProviderDetailResponse } from "@/types/provider"

export const providerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProviderById: builder.query<ProviderDetailResponse, string>({
      query: (id) => `/prodivers/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: "Provider", id }],
    }),
  }),
})

export const { useGetProviderByIdQuery } = providerApi
