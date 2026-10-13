import { baseApi } from "@/store/api/base-api"
import type {
  CategoryDetailResponse,
  CategoryListParams,
  CategoryListResponse,
} from "@/types/category"

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryListResponse, CategoryListParams | void>({
      query: (params) => ({
        url: "/category",
        params: params ?? undefined,
      }),
      providesTags: ["Category"],
    }),
    getCategoryById: builder.query<CategoryDetailResponse, string>({
      query: (id) => `/category/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: "Category", id }],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useLazyGetCategoriesQuery,
  useGetCategoryByIdQuery,
} = categoryApi
