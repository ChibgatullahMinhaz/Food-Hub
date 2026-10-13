import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL

if (!configuredApiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is required")
}

export const baseApi = createApi({
  reducerPath: "foodHubApi",
  baseQuery: fetchBaseQuery({
    baseUrl: configuredApiUrl.replace(/\/+$/, ""),
    credentials: "include",
  }),
  tagTypes: [
    "Meal",
    "Category",
    "Cart",
    "Order",
    "Review",
    "Profile",
    "Provider",
    "User",
  ],
  endpoints: () => ({}),
})
