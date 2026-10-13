import type { ApiResponse, CursorMeta, ProviderStatus } from "@/types/api"

export interface ProviderApplication {
  id: string
  userId: string
  restaurantName: string
  description: string | null
  bannerImage: string | null
  cuisineType: string | null
  address: string
  phone: string
  isOpen: boolean
  status: ProviderStatus
  createdAt: string
  updatedAt?: string
  user?: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

export interface ProviderListParams {
  cursor?: string
  limit?: number
  status?: ProviderStatus
  search?: string
  sortOrder?: "asc" | "desc"
}

export type ProviderListResponse = ApiResponse<
  ProviderApplication[],
  CursorMeta
>

export interface ApplyProviderPayload {
  restaurantName: string
  address: string
  phone: string
  description?: string
  cuisineType?: string
}

export type ProviderApplicationResponse = ApiResponse<ProviderApplication>
export type MyProviderProfileResponse = ApiResponse<ProviderApplication | null>

export interface ProviderMeal {
  id: string
  name: string
  price: number | string
  images: string[]
  isVegetarian: boolean
  category: { name: string }
}

export interface ProviderDetail {
  id: string
  userId: string
  restaurantName: string
  description: string | null
  bannerImage: string | null
  cuisineType: string | null
  address: string
  phone: string
  isOpen: boolean
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    image: string | null
    status: string
  }
  meals: ProviderMeal[]
  _count: { meals: number }
}

export type ProviderDetailResponse = ApiResponse<ProviderDetail>
