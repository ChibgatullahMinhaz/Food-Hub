import { baseApi } from "@/store/api/base-api"
import type {
  MealDetailResponse,
  MealListParams,
  MealListResponse,
} from "@/types/meal"

export const mealApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  useGetMealsQuery,
  useLazyGetMealsQuery,
  useGetMealByIdQuery,
} = mealApi
