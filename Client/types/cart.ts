import type { ApiResponse } from "@/types/api"

export interface CartMeal {
  id: string
  name: string
  price: number | string
  images: string[]
  isAvailable?: boolean
  providerId?: string
  provider?: {
    id: string
    restaurantName: string
  }
}

export interface CartItem {
  id: string
  cartId: string
  mealId: string
  quantity: number
  instructions?: string | null
  createdAt: string
  updatedAt: string
  meal: CartMeal
}

export interface Cart {
  id: string | null
  items: CartItem[]
  subtotal: number
  createdAt?: string
  updatedAt?: string
}

export interface ClearCartResult {
  message: string
}

export interface DeletedCartItem {
  id: string
  cartId: string
  mealId: string
  quantity: number
  instructions?: string | null
  createdAt: string
  updatedAt: string
}

export type CartResponse = ApiResponse<Cart>
export type CartItemResponse = ApiResponse<CartItem>
export type DeletedCartItemResponse = ApiResponse<DeletedCartItem>
export type ClearCartResponse = ApiResponse<ClearCartResult>
