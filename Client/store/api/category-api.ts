import { baseApi } from "@/store/api/base-api"
import type {
  CategoryDetailResponse,
  CategoryListParams,
  CategoryListResponse,
  CategoryMutationResponse,
} from "@/types/category"

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation<CategoryMutationResponse, FormData>({
      query: (body) => ({ url: "/category", method: "POST", body }),
      invalidatesTags: ["Category", "Meal"],
    }),
    updateCategory: builder.mutation<
      CategoryMutationResponse,
      { id: string; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: `/category/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Category", "Meal"],
    }),
    deleteCategory: builder.mutation<CategoryMutationResponse, string>({
      query: (id) => ({
        url: `/category/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category", "Meal"],
    }),
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
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useLazyGetCategoriesQuery,
  useGetCategoryByIdQuery,
} = categoryApi
