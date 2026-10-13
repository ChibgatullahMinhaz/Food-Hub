import { baseApi } from "@/store/api/base-api"
import type {
  MealDetailResponse,
  MealListParams,
  MealListResponse,
} from "@/types/meal"
import type { ApiResponse } from "@/types/api"

type MealMutationResponse = ApiResponse<{ id: string }>

export const mealApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createMeal: builder.mutation<MealMutationResponse, FormData>({
      query: (body) => ({ url: "/meals", method: "POST", body }),
      invalidatesTags: ["Meal", "Provider"],
    }),
    updateMeal: builder.mutation<
      MealMutationResponse,
      { id: string; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: `/meals/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Meal", "Provider", "Cart"],
    }),
    deleteMeal: builder.mutation<MealMutationResponse, string>({
      query: (id) => ({
        url: `/meals/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Meal", "Provider", "Cart"],
    }),
    getMeals: builder.query<MealListResponse, MealListParams | void>({
      query: (params) => ({
        url: "/meals",
        params: params ?? undefined,
      }),
      providesTags: ["Meal"],
    }),
    getMealById: builder.query<MealDetailResponse, string>({
      query: (id) => `/meals/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: "Meal", id }],
    }),
  }),
})

export const {
  useCreateMealMutation,
  useUpdateMealMutation,
  useDeleteMealMutation,
  useGetMealsQuery,
  useLazyGetMealsQuery,
  useGetMealByIdQuery,
} = mealApi
