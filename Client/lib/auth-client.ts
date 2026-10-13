import { createAuthClient } from "better-auth/react"

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL

if (!authUrl) {
  throw new Error("NEXT_PUBLIC_AUTH_URL is required")
}

export const authClient = createAuthClient({
  baseURL: authUrl.replace(/\/+$/, ""),
  fetchOptions: {
    credentials: "include",
  },
})
