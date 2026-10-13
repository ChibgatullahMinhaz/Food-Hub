"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, LoaderCircle, LogOut, UserRound } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { dashboardPathByRole } from "@/lib/auth-routes"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAppDispatch } from "@/hooks/hooks"
import { baseApi } from "@/store/api/base-api"
import { useLazyGetCurrentProfileQuery } from "@/store/api/profile-api"

function getSafeNextPath(path: string | null): string {
  if (
    !path ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.startsWith("/login") ||
    path.startsWith("/register")
  ) {
    return "/"
  }

  return path
}

function ProfileError({ onRetry }: { onRetry: () => void }) {
  const [signOutError, setSignOutError] = useState("")

  async function handleSignOut() {
    setSignOutError("")

    try {
      const result = await authClient.signOut()

      if (result.error) {
        setSignOutError(result.error.message || "Could not sign out.")
      }
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : "Could not sign out."
      )
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>We couldn’t load your account</CardTitle>
        <CardDescription>
          Your sign-in was recognized, but FoodHub couldn’t verify the account
          profile. Please retry or sign out and try again.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button onClick={onRetry}>Try again</Button>
        <Button
          onClick={() => void handleSignOut()}
          variant="outline"
        >
          Sign out
        </Button>
        {signOutError && (
          <p className="w-full text-sm text-destructive" role="alert">
            {signOutError}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardRouter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const session = authClient.useSession()
  const [loadProfile, profile] = useLazyGetCurrentProfileQuery()
  const requestedUserId = useRef<string | null>(null)

  useEffect(() => {
    if (session.isPending) {
      return
    }

    const userId = session.data?.user.id

    if (!userId) {
      requestedUserId.current = null
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }

    if (requestedUserId.current !== userId) {
      requestedUserId.current = userId
      void loadProfile()
    }
  }, [loadProfile, pathname, router, session.data?.user.id, session.isPending])

  useEffect(() => {
    const userId = session.data?.user.id
    const userStatus = profile.data?.data.status

    if (
      userId &&
      profile.data?.data.id === userId &&
      userStatus &&
      userStatus !== "ACTIVE"
    ) {
      void authClient.signOut().then(({ error }) => {
        if (error) {
          return
        }

        requestedUserId.current = null
        router.replace(`/login?reason=${userStatus.toLowerCase()}`)
      })
    }
  }, [profile.data, router, session.data?.user.id])

  useEffect(() => {
    const userProfile = profile.data?.data

    if (!userProfile || userProfile.id !== session.data?.user.id) {
      return
    }

    if (userProfile.status !== "ACTIVE") {
      return
    }

    const role = userProfile.role
    const nextPath = getSafeNextPath(searchParams.get("next"))
    const rolePath = dashboardPathByRole[role]
    const destination =
      nextPath === "/" || nextPath === "/dashboard" ? rolePath : nextPath

    router.replace(destination)
  }, [profile.data, router, searchParams, session.data?.user.id])

  if (
    session.isPending ||
    (session.data && profile.isUninitialized) ||
    profile.isFetching
  ) {
    return (
      <div
        aria-live="polite"
        className="flex min-h-[60vh] items-center justify-center gap-3 text-muted-foreground"
      >
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        <span>Checking your FoodHub account...</span>
      </div>
    )
  }

  if (!session.data) {
    return (
      <div
        aria-live="polite"
        className="flex min-h-[60vh] items-center justify-center"
      >
        <LoaderCircle
          aria-hidden="true"
          className="size-5 animate-spin text-muted-foreground"
        />
      </div>
    )
  }

  if (profile.error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <ProfileError onRetry={() => void loadProfile()} />
      </div>
    )
  }

  if (profile.data?.data.id === session.data.user.id &&
      profile.data.data.status !== "ACTIVE") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Account access unavailable</CardTitle>
            <CardDescription>
              This account is {profile.data.data.status.toLowerCase()}. Contact
              FoodHub support if you think this is a mistake.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return null
}

export function AccountNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const session = authClient.useSession()
  const dispatch = useAppDispatch()
  const [loadProfile, profile] = useLazyGetCurrentProfileQuery()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState("")
  const requestedUserId = useRef<string | null>(null)

  useEffect(() => {
    if (session.isPending) {
      return
    }

    const userId = session.data?.user.id ?? null

    if (requestedUserId.current !== userId) {
      requestedUserId.current = userId

      if (userId) {
        void loadProfile(undefined, true)
      }
    }
  }, [
    loadProfile,
    session.data?.user.id,
    session.isPending,
  ])

  async function handleSignOut() {
    setIsSigningOut(true)
    setSignOutError("")

    try {
      const result = await authClient.signOut()

      if (result.error) {
        setSignOutError(result.error.message || "Could not sign out.")
        return
      }

      dispatch(baseApi.util.resetApiState())
      setIsMenuOpen(false)
      router.replace("/")
      router.refresh()
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : "Could not sign out."
      )
    } finally {
      setIsSigningOut(false)
    }
  }

  if (session.isPending) {
    return null
  }

  if (!session.data) {
    if (pathname === "/login" || pathname === "/register") {
      return null
    }

    return (
      <Link className="header-signin" href="/login">
        Sign in
      </Link>
    )
  }

  const name = profile.data?.data.name ?? session.data.user.name
  const role = profile.data?.data.role

  return (
    <div className="account-menu">
      <button
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        className="account-menu__trigger"
        onClick={() => setIsMenuOpen((open) => !open)}
        type="button"
      >
        <span className="account-menu__avatar" aria-hidden="true">
          {name.trim().charAt(0).toUpperCase() || <UserRound />}
        </span>
        <span className="account-menu__name">{name}</span>
        <ChevronDown aria-hidden="true" className="account-menu__chevron" />
      </button>
      {isMenuOpen && (
        <div className="account-menu__popover" role="menu">
          <div className="account-menu__identity">
            <strong>{name}</strong>
            <span>{session.data.user.email}</span>
            {role && <small>{role.toLowerCase()}</small>}
          </div>
          <button
            className="account-menu__logout"
            disabled={isSigningOut}
            onClick={() => void handleSignOut()}
            role="menuitem"
            type="button"
          >
            {isSigningOut ? (
              <LoaderCircle aria-hidden="true" className="auth-spinner" />
            ) : (
              <LogOut aria-hidden="true" />
            )}
            Sign out
          </button>
          {signOutError && (
            <p className="account-menu__error" role="alert">
              {signOutError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
