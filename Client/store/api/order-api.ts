import { baseApi } from "@/store/api/base-api"
import type {
  CreateOrderPayload,
  OrderDetailResponse,
  OrderListParams,
  OrderListResponse,
  OrderResponse,
} from "@/types/order"
import type { ApiResponse, OrderStatus } from "@/types/api"

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<OrderResponse, CreateOrderPayload>({
      query: (body) => ({ url: "/order", method: "POST", body }),
      invalidatesTags: ["Order", "Cart"],
    }),
    getMyOrders: builder.query<OrderListResponse, OrderListParams>({
      query: ({ cursor, limit, status }) => ({
        url: "/order/my-orders",
        params: { cursor, limit, status },
      }),
      providesTags: ["Order"],
    }),
    getProviderOrders: builder.query<OrderListResponse, OrderListParams>({
      query: ({ cursor, limit, status }) => ({
        url: "/order/provider-orders",
        params: { cursor, limit, status },
      }),
      providesTags: ["Order"],
    }),
    getOrderById: builder.query<OrderDetailResponse, string>({
      query: (id) => `/order/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),
    cancelOrder: builder.mutation<
      ApiResponse<Pick<OrderResponse["data"], "id" | "status">>,
      string
    >({
      query: (id) => ({
        url: `/order/${encodeURIComponent(id)}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["Order"],
    }),
    updateOrderStatus: builder.mutation<
      ApiResponse<Pick<OrderResponse["data"], "id" | "status">>,
      { id: string; status: OrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `/order/${encodeURIComponent(id)}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Order"],
    }),
  }),
})

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useLazyGetMyOrdersQuery,
  useGetProviderOrdersQuery,
  useLazyGetProviderOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useUpdateOrderStatusMutation,
} = orderApi
