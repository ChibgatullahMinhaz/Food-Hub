import type { ApiResponse } from "@/types/api"

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
