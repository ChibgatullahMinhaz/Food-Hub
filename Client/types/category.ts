import type { ApiResponse, CursorMeta } from "@/types/api"

export interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  createdAt: string
  updatedAt: string
  _count?: { meals: number }
}

export interface CategoryListParams {
  cursor?: string
  limit?: number
  search?: string
  sortBy?: "name" | "createdAt"
  sortOrder?: "asc" | "desc"
}

export interface CategoryListData {
  meta: CursorMeta
  data: Category[]
}

export type CategoryListResponse = ApiResponse<CategoryListData>
export type CategoryDetailResponse = ApiResponse<Category>
