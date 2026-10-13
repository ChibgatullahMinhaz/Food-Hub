"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch } from "@/hooks/hooks"
import { baseApi } from "@/store/api/base-api"

export function AuthSessionBoundary({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const session = authClient.useSession()
  const currentUserId = useRef<string | null>(null)
  const hasResolvedSession = useRef(false)

  useEffect(() => {
    if (session.isPending) {
      return
    }

    const nextUserId = session.data?.user.id ?? null

    if (!hasResolvedSession.current) {
      currentUserId.current = nextUserId
      hasResolvedSession.current = true
      return
    }

    if (currentUserId.current !== nextUserId) {
      if (currentUserId.current !== null) {
        dispatch(baseApi.util.resetApiState())
      }

      currentUserId.current = nextUserId
    }
  }, [dispatch, session.data?.user.id, session.isPending])

  return children
}
