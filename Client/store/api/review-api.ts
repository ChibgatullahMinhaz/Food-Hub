import { baseApi } from "@/store/api/base-api"
import type { ApiResponse } from "@/types/api"
import type {
  CreateReviewPayload,
  ReviewListParams,
  ReviewListResponse,
  ReviewMutationResponse,
  UpdateReviewPayload,
} from "@/types/review"

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMealReviews: builder.query<ReviewListResponse, ReviewListParams>({
      query: ({ id, cursor, limit }) => ({
        url: `/review/meal/${encodeURIComponent(id)}`,
        params: { cursor, limit },
      }),
      providesTags: ["Review"],
    }),
    getProviderReviews: builder.query<ReviewListResponse, ReviewListParams>({
      query: ({ id, cursor, limit }) => ({
        url: `/review/provider/${encodeURIComponent(id)}`,
        params: { cursor, limit },
      }),
      providesTags: ["Review"],
    }),
    createReview: builder.mutation<
      ReviewMutationResponse,
      CreateReviewPayload
    >({
      query: (body) => ({ url: "/review", method: "POST", body }),
      invalidatesTags: ["Review"],
    }),
    updateReview: builder.mutation<
      ReviewMutationResponse,
      UpdateReviewPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/review/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Review"],
    }),
    deleteReview: builder.mutation<
      ApiResponse<ReviewMutationResponse["data"]>,
      string
    >({
      query: (id) => ({
        url: `/review/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Review"],
    }),
  }),
})

export const {
  useGetMealReviewsQuery,
  useLazyGetMealReviewsQuery,
  useGetProviderReviewsQuery,
  useLazyGetProviderReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi
