"use client"

import { useEffect, useRef, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { AccountNavigation } from "@/components/auth/auth-navigation"
import { authClient } from "@/lib/auth-client"
import { ApiErrorMessage } from "@/components/api/api-error-message"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useLazyGetCurrentProfileQuery } from "@/store/api/profile-api"
import type { Role } from "@/types/api"

type RoleWorkspaceProps = {
  role: Role
  title: string
  description: string
  children?: ReactNode
}

const defaultDestinationByRole: Record<Role, string> = {
  CUSTOMER: "/customer",
  PROVIDER: "/seller",
  ADMIN: "/admin",
}

export function RoleWorkspace({
  role,
  title,
  description,
  children,
}: RoleWorkspaceProps) {
  const router = useRouter()
  const session = authClient.useSession()
  const [loadProfile, profile] = useLazyGetCurrentProfileQuery()
  const requestedUserId = useRef<string | null>(null)

  useEffect(() => {
    if (session.isPending) {
      return
    }

    const userId = session.data?.user.id

    if (!userId) {
      router.replace(`/login?next=${encodeURIComponent(defaultDestinationByRole[role])}`)
      return
    }

    if (requestedUserId.current !== userId) {
      requestedUserId.current = userId
      void loadProfile()
    }
  }, [loadProfile, role, router, session.data?.user.id, session.isPending])

  useEffect(() => {
    const currentProfile = profile.data?.data

    if (
      currentProfile &&
      currentProfile.id === session.data?.user.id &&
      currentProfile.status === "ACTIVE" &&
      currentProfile.role !== role
    ) {
      router.replace(defaultDestinationByRole[currentProfile.role])
    }
  }, [profile.data, role, router, session.data?.user.id])

  if (session.isPending || (session.data && profile.isUninitialized) || profile.isFetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-muted-foreground">
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        Checking your FoodHub account...
      </div>
    )
  }

  if (!session.data) {
    return null
  }

  if (profile.error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>We couldn’t verify your account</CardTitle>
            <CardDescription>
              FoodHub requires a fresh business profile before showing this
              workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ApiErrorMessage
              error={profile.error}
              onRetry={() => void loadProfile()}
            />
            <Link className="text-sm text-primary underline" href="/">
              Back to home
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentProfile = profile.data?.data

  if (!currentProfile || currentProfile.id !== session.data.user.id) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-muted-foreground">
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        Checking your FoodHub account...
      </div>
    )
  }

  if (currentProfile.status !== "ACTIVE") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Account access unavailable</CardTitle>
            <CardDescription>
              This account is {currentProfile.status.toLowerCase()}. Contact
              FoodHub support if you think this is a mistake.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (currentProfile.role !== role) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-muted-foreground">
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        Taking you to your account...
      </div>
    )
  }

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center gap-5 px-4 py-12 sm:px-6">
      <div className="flex w-full justify-end">
        <AccountNavigation />
      </div>
      <Card className="w-full">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {currentProfile.role.toLowerCase()} workspace
          </p>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Signed in as {currentProfile.name}.</p>
          <p>
            Account status:{" "}
            <span className="font-medium text-foreground">
              {currentProfile.status.toLowerCase()}
            </span>
          </p>
          {children && (
            <div className="flex flex-wrap gap-3 pt-4">
              {children}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
