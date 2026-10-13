import type { ApiResponse, CursorMeta, OrderStatus } from "@/types/api"

export interface OrderMeal {
  id: string
  name: string
  images: string[]
}

export interface OrderItem {
  id: string
  orderId: string
  mealId: string
  quantity: number
  price: number | string
  createdAt: string
  updatedAt: string
  meal: OrderMeal
}

export interface OrderCustomer {
  id: string
  name: string
  email: string
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  status: OrderStatus
  totalAmount: number | string
  deliveryAddress: string
  contactPhone: string
  paymentMethod: string
  specialInstructions: string | null
  createdAt: string
  updatedAt: string
  customer?: OrderCustomer
  items: OrderItem[]
}

export interface OrderListParams {
  cursor?: string
  limit: number
  status?: OrderStatus
}

export interface CreateOrderPayload {
  deliveryAddress: string
  contactPhone: string
  paymentMethod: "CASH_ON_DELIVERY"
  specialInstructions?: string
}

export type OrderResponse = ApiResponse<Order>
export type OrderListResponse = ApiResponse<Order[], CursorMeta>
export type OrderDetailResponse = ApiResponse<Order>
