"use client"

import { useState } from "react"
import { Check, LoaderCircle, X } from "lucide-react"
import { ApiErrorMessage } from "@/components/api/api-error-message"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  useGetProviderApplicationsQuery,
  useLazyGetProviderApplicationsQuery,
  useUpdateProviderStatusMutation,
} from "@/store/api/provider-api"
import type { ProviderApplication } from "@/types/provider"

function submittedDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(date)
}

export function ProviderApprovalPanel() {
  const applications = useGetProviderApplicationsQuery({
    status: "PENDING",
    limit: 10,
    sortOrder: "desc",
  })
  const [loadNextPage, nextPage] = useLazyGetProviderApplicationsQuery()
  const [updateStatus, updateResult] = useUpdateProviderStatusMutation()
  const [additional, setAdditional] = useState<ProviderApplication[]>([])
  const [nextCursor, setNextCursor] = useState<string | null | undefined>()
  const [search, setSearch] = useState("")
  const [actionError, setActionError] = useState("")
  const items = [...(applications.data?.data ?? []), ...additional]
  const cursor =
    nextCursor === undefined
      ? applications.data?.meta?.nextCursor
      : nextCursor

  async function handleLoadMore() {
    if (!cursor || nextPage.isFetching) return

    const result = await loadNextPage({
      status: "PENDING",
      limit: 10,
      sortOrder: "desc",
      cursor,
    })
    if ("data" in result && result.data) {
      const page = result.data
      setAdditional((current) => {
        const known = new Set(current.map((provider) => provider.id))
        return [
          ...current,
          ...page.data.filter((provider) => !known.has(provider.id)),
        ]
      })
      setNextCursor(page.meta?.nextCursor ?? null)
    }
  }

  async function handleDecision(
    provider: ProviderApplication,
    status: "APPROVED" | "REJECTED"
  ) {
    setActionError("")
    const result = await updateStatus({ id: provider.id, status })
    if ("error" in result) {
      setActionError(
        `Could not ${status === "APPROVED" ? "approve" : "reject"} ${provider.restaurantName}.`
      )
      return
    }
    setAdditional((current) =>
      current.filter((item) => item.id !== provider.id)
    )
  }

  const visibleItems = items.filter((provider) => {
    const query = search.trim().toLocaleLowerCase()
    return (
      !query ||
      provider.restaurantName.toLocaleLowerCase().includes(query) ||
      provider.address.toLocaleLowerCase().includes(query) ||
      provider.phone.toLocaleLowerCase().includes(query) ||
      provider.user?.name.toLocaleLowerCase().includes(query) ||
      provider.user?.email.toLocaleLowerCase().includes(query)
    )
  })

  return (
    <section className="w-full space-y-4" aria-labelledby="provider-review-title">
      <Card>
        <CardHeader>
          <CardTitle id="provider-review-title">Provider applications</CardTitle>
          <CardDescription>
            Review pending restaurant applications. Approval promotes the
            applicant to the PROVIDER role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="grid gap-2 text-sm font-medium">
            Search loaded applications
            <Input
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Restaurant, applicant, phone or address"
              value={search}
            />
          </label>
          {applications.error && (
            <ApiErrorMessage
              error={applications.error}
              onRetry={() => void applications.refetch()}
            />
          )}
          {actionError && (
            <p className="text-sm text-destructive" role="alert">
              {actionError}
            </p>
          )}
          {updateResult.error && (
            <ApiErrorMessage error={updateResult.error} />
          )}
          {applications.isLoading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              Loading applications...
            </p>
          )}
          {!applications.isLoading &&
            !applications.error &&
            !visibleItems.length && (
              <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                {search
                  ? "No loaded applications match that search."
                  : "There are no pending provider applications."}
              </p>
            )}
          <div className="grid gap-3">
            {visibleItems.map((provider) => (
              <article
                className="rounded-xl border p-4"
                key={provider.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-semibold">{provider.restaurantName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {provider.user?.name ?? "Applicant"} ·{" "}
                      {provider.user?.email ?? "Email unavailable"}
                    </p>
                    <p className="text-sm">
                      {provider.address} · {provider.phone}
                    </p>
                    {provider.cuisineType && (
                      <p className="text-sm text-muted-foreground">
                        Cuisine: {provider.cuisineType}
                      </p>
                    )}
                    {provider.description && (
                      <p className="text-sm text-muted-foreground">
                        {provider.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Submitted {submittedDate(provider.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      disabled={updateResult.isLoading}
                      onClick={() => void handleDecision(provider, "APPROVED")}
                      size="sm"
                    >
                      {updateResult.isLoading ? (
                        <LoaderCircle
                          aria-hidden="true"
                          className="animate-spin"
                        />
                      ) : (
                        <Check aria-hidden="true" />
                      )}
                      Approve
                    </Button>
                    <Button
                      disabled={updateResult.isLoading}
                      onClick={() => void handleDecision(provider, "REJECTED")}
                      size="sm"
                      variant="outline"
                    >
                      <X aria-hidden="true" />
                      Reject
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {cursor && (
            <div className="flex justify-center">
              <Button
                disabled={nextPage.isFetching}
                onClick={() => void handleLoadMore()}
                variant="outline"
              >
                {nextPage.isFetching ? "Loading..." : "Load more applications"}
              </Button>
            </div>
          )}
          {nextPage.error && (
            <ApiErrorMessage
              error={nextPage.error}
              onRetry={() => void handleLoadMore()}
            />
          )}
        </CardContent>
      </Card>
    </section>
  )
}
