import { baseApi } from "@/store/api/base-api"
import type {
  CartItemResponse,
  CartResponse,
  ClearCartResponse,
  DeletedCartItemResponse,
} from "@/types/cart"

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<CartResponse, void>({
      query: () => "/cart",
      providesTags: ["Cart"],
    }),
    addCartItem: builder.mutation<
      CartItemResponse,
      { mealId: string; quantity: number }
    >({
      query: (body) => ({ url: "/cart/items", method: "POST", body }),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation<
      CartItemResponse,
      { itemId: string; quantity: number }
    >({
      query: ({ itemId, quantity }) => ({
        url: `/cart/items/${encodeURIComponent(itemId)}`,
        method: "PATCH",
        body: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    removeCartItem: builder.mutation<DeletedCartItemResponse, string>({
      query: (itemId) => ({
        url: `/cart/items/${encodeURIComponent(itemId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
    clearCart: builder.mutation<ClearCartResponse, void>({
      query: () => ({ url: "/cart", method: "DELETE" }),
      invalidatesTags: ["Cart"],
    }),
  }),
})

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi
