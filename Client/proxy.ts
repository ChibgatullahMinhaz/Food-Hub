import { getSessionCookie } from "better-auth/cookies"
import { NextResponse, type NextRequest } from "next/server"
import { dashboardPathByRole } from "@/lib/auth-routes"
import type { Role, UserStatus } from "@/types/api"

type GuardProfile = { id: string; role: Role; status: UserStatus }

function isGuardProfile(value: unknown): value is GuardProfile {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    "role" in value &&
    (value.role === "CUSTOMER" ||
      value.role === "PROVIDER" ||
      value.role === "ADMIN") &&
    "status" in value &&
    (value.status === "ACTIVE" ||
      value.status === "BLOCKED" ||
      value.status === "SUSPENDED")
  )
}

function denyAccess(status: 403 | 503, message: string) {
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>FoodHub account access</title></head><body><main><h1>Account access unavailable</h1><p>${message}</p><p><a href="">Try again</a> | <a href="/">Back to home</a></p></main></body></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
        ...(status === 503 ? { "Retry-After": "5" } : {}),
      },
    }
  )
}

function redirectToLogin(request: NextRequest) {
  const url = new URL("/login", request.url)
  url.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  )
  const response = NextResponse.redirect(url)
  response.headers.set("Cache-Control", "private, no-store")
  return response
}

export async function proxy(request: NextRequest) {
  const requiredRole = (
    Object.keys(dashboardPathByRole) as Role[]
  ).find((role) => {
    const path = dashboardPathByRole[role]
    return (
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(`${path}/`)
    )
  })

  if (!requiredRole) return NextResponse.next()
  if (!getSessionCookie(request)) return redirectToLogin(request)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) {
    console.error("Proxy auth: NEXT_PUBLIC_API_URL is required")
    return denyAccess(503, "Account verification is not configured.")
  }

  try {
    const result = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/admin/users/current/profile`,
      {
        headers: { cookie: request.headers.get("cookie") ?? "" },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(5000),
      }
    )

    if (result.status === 401) return redirectToLogin(request)
    if (result.status === 403) {
      return denyAccess(403, "Your account cannot access this workspace.")
    }
    if (!result.ok) {
      console.error("Proxy auth: profile request failed", result.status)
      return denyAccess(503, "We could not verify your account. Please retry.")
    }

    const body: unknown = await result.json()
    if (
      typeof body !== "object" ||
      body === null ||
      !("success" in body) ||
      body.success !== true ||
      !("data" in body) ||
      !isGuardProfile(body.data)
    ) {
      console.error("Proxy auth: invalid profile response")
      return denyAccess(503, "We could not verify your account. Please retry.")
    }

    const profile = body.data
    if (profile.status !== "ACTIVE") {
      return denyAccess(
        403,
        `This account is ${profile.status.toLowerCase()}. Contact FoodHub support.`
      )
    }
    if (profile.role !== requiredRole) {
      const response = NextResponse.redirect(
        new URL(dashboardPathByRole[profile.role], request.url)
      )
      response.headers.set("Cache-Control", "private, no-store")
      return response
    }

    const response = NextResponse.next()
    response.headers.set("Cache-Control", "private, no-store")
    return response
  } catch (error) {
    console.error(
      "Proxy auth: account verification failed",
      error instanceof Error ? error.name : "Unknown error"
    )
    return denyAccess(503, "We could not verify your account. Please retry.")
  }
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/customer/:path*"],
}
