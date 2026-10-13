import type { ApiResponse } from "@/types/api"

export interface MealListItem {
  id: string
  name: string
  description: string
  price: number | string
  preparationTime: number
  images: string[]
  isAvailable: boolean
  isVegetarian: boolean
  dietaryType: string | null
  providerId: string
  categoryId: string
  createdAt: string
  updatedAt: string
  category: { id: string; name: string; slug: string }
  provider: { id: string; restaurantName: string }
}

export interface MealListParams {
  cursor?: string
  limit?: number
  search?: string
  categoryId?: string
  providerId?: string
  isAvailable?: boolean
  isVegetarian?: boolean
  dietaryType?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: "price" | "createdAt" | "name"
  sortOrder?: "asc" | "desc"
}

export type MealListResponse = ApiResponse<MealListItem[]>

export interface MealDetail extends Omit<MealListItem, "category" | "provider"> {
  category: {
    id: string
    name: string
    slug: string
    image: string | null
    createdAt: string
    updatedAt: string
  }
  provider: {
    id: string
    restaurantName: string
    address: string
    phone: string
  }
}

export type MealDetailResponse = ApiResponse<MealDetail>
