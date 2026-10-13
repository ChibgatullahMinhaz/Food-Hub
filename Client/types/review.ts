import type { ApiResponse } from "@/types/api"

export interface Review {
  id: string
  customerId: string
  mealId: string
  orderId: string | null
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    name: string
  }
  meal?: {
    id: string
    name: string
  }
}

export interface ReviewMeta {
  limit: number
  nextCursor: string | null
  hasMore: boolean
  totalReviews: number
  averageRating: number
}

export type ReviewListResponse = ApiResponse<Review[], ReviewMeta>

export interface ReviewListParams {
  id: string
  cursor?: string
  limit: number
}

export interface CreateReviewPayload {
  mealId: string
  orderId?: string
  rating: number
  comment: string
}

export interface UpdateReviewPayload {
  id: string
  rating: number
  comment: string
}

export type ReviewMutationResponse = ApiResponse<{ id: string }>
