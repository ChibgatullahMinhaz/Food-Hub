"use client"

import { useState } from "react"
import { ChevronDown, LoaderCircle, Search, Trash2 } from "lucide-react"
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
import { authClient } from "@/lib/auth-client"
import {
  useDeleteAdminUserMutation,
  useGetAdminUserDetailsQuery,
  useGetAdminUsersQuery,
  useLazyGetAdminUsersQuery,
  useUpdateAdminUserMutation,
} from "@/store/api/admin-user-api"
import type { AdminUserListParams } from "@/store/api/admin-user-api"
import type { AdminUser, Role, UserStatus } from "@/types/api"

function dateLabel(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(date)
}

function userStatusLabel(status: UserStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

function AdminUserCard({
  user,
  isSelf,
  onDeleted,
}: {
  user: AdminUser
  isSelf: boolean
  onDeleted: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState(user.name)
  const [role, setRole] = useState<Role>(user.role)
  const [status, setStatus] = useState<UserStatus>(user.status)
  const [message, setMessage] = useState("")
  const details = useGetAdminUserDetailsQuery(user.id, { skip: !expanded })
  const [updateUser, updateResult] = useUpdateAdminUserMutation()
  const [deleteUser, deleteResult] = useDeleteAdminUserMutation()
  const changed =
    name.trim() !== user.name || role !== user.role || status !== user.status

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    const body: { name?: string; role?: Role; status?: UserStatus } = {}
    if (name.trim() !== user.name) body.name = name.trim()
    if (!isSelf && role !== user.role) body.role = role
    if (!isSelf && status !== user.status) body.status = status

    const result = await updateUser({ id: user.id, body })
    if ("data" in result) {
      setMessage("Account updated.")
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${user.name} (${user.email})? This cannot be undone. Users with related order records may not be deletable.`
    )
    if (!confirmed) return

    setMessage("")
    const result = await deleteUser(user.id)
    if ("data" in result) {
      setMessage("Account deleted.")
      onDeleted(user.id)
    }
  }

  return (
    <article className="rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="font-semibold">
            {user.name} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
          </h3>
          <p className="break-all text-sm text-muted-foreground">
            {user.email}
          </p>
          <p className="text-sm text-muted-foreground">
            {user.phone || "No phone"} · Joined {dateLabel(user.createdAt)}
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            <span className="rounded-full bg-secondary px-2.5 py-1">
              {user.role}
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1">
              {userStatusLabel(user.status)}
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1">
              {user._count.orders} orders
            </span>
            {user.providerProfile && (
              <span className="rounded-full bg-secondary px-2.5 py-1">
                {user.providerProfile.restaurantName} ·{" "}
                {user.providerProfile.status.toLowerCase()}
              </span>
            )}
            {!user.emailVerified && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-900">
                Email unverified
              </span>
            )}
          </div>
        </div>
        <Button
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          size="sm"
          variant="outline"
        >
          <ChevronDown
            aria-hidden="true"
            className={expanded ? "rotate-180 transition-transform" : "transition-transform"}
          />
          {expanded ? "Hide details" : "Details"}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t pt-4">
          {details.error && (
            <ApiErrorMessage
              error={details.error}
              onRetry={() => void details.refetch()}
            />
          )}
          {details.isLoading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              Loading account details...
            </p>
          )}
          {details.data && (
            <div className="space-y-2 text-sm">
              <p>
                Total orders:{" "}
                <span className="font-medium">
                  {details.data.data._count.orders}
                </span>
              </p>
              <h4 className="font-medium">Latest orders</h4>
              {details.data.data.orders.length ? (
                <ul className="space-y-2">
                  {details.data.data.orders.map((order) => (
                    <li
                      className="flex flex-wrap justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2"
                      key={order.id}
                    >
                      <span>
                        {order.status} · {dateLabel(order.createdAt)}
                      </span>
                      <span>
                        {new Intl.NumberFormat("en-BD", {
                          style: "currency",
                          currency: "BDT",
                        }).format(Number(order.totalAmount))}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No orders found.</p>
              )}
            </div>
          )}

          <form
            className="grid gap-3 border-t pt-4 sm:grid-cols-2"
            onSubmit={(event) => void handleUpdate(event)}
          >
            <label className="grid gap-2 text-sm font-medium sm:col-span-2">
              Display name
              <Input
                minLength={2}
                onChange={(event) => setName(event.currentTarget.value)}
                required
                value={name}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Role
              <select
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm disabled:opacity-60"
                disabled={isSelf}
                onChange={(event) => setRole(event.currentTarget.value as Role)}
                value={role}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="PROVIDER">Provider</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Status
              <select
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm disabled:opacity-60"
                disabled={isSelf}
                onChange={(event) =>
                  setStatus(event.currentTarget.value as UserStatus)
                }
                value={status}
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </label>
            {isSelf && (
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Your own role and account status are locked here to prevent
                losing admin access.
              </p>
            )}
            {(message || updateResult.error || deleteResult.error) && (
              <div className="space-y-2 sm:col-span-2">
                {message && (
                  <p className="text-sm text-green-700 dark:text-green-300" role="status">
                    {message}
                  </p>
                )}
                {updateResult.error && (
                  <ApiErrorMessage error={updateResult.error} />
                )}
                {deleteResult.error && (
                  <ApiErrorMessage error={deleteResult.error} />
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button disabled={!changed || updateResult.isLoading} type="submit">
                {updateResult.isLoading ? "Saving..." : "Save account"}
              </Button>
              {!isSelf && (
                <Button
                  disabled={deleteResult.isLoading}
                  onClick={() => void handleDelete()}
                  type="button"
                  variant="destructive"
                >
                  <Trash2 aria-hidden="true" />
                  {deleteResult.isLoading ? "Deleting..." : "Delete account"}
                </Button>
              )}
            </div>
          </form>
        </div>
      )}
    </article>
  )
}

function AdminUsersResults({
  params,
  currentUserId,
}: {
  params: AdminUserListParams
  currentUserId: string | undefined
}) {
  const users = useGetAdminUsersQuery(params)
  const [loadNext, nextPage] = useLazyGetAdminUsersQuery()
  const [additional, setAdditional] = useState<AdminUser[]>([])
  const [nextCursor, setNextCursor] = useState<string | null | undefined>()
  const allUsers = [...(users.data?.data ?? []), ...additional]
  const cursor =
    nextCursor === undefined ? users.data?.meta?.nextCursor : nextCursor

  async function handleLoadMore() {
    if (!cursor || nextPage.isFetching) return
    const result = await loadNext({ ...params, cursor })
    if ("data" in result && result.data) {
      const page = result.data
      setAdditional((current) => {
        const known = new Set(current.map((user) => user.id))
        return [...current, ...page.data.filter((user) => !known.has(user.id))]
      })
      setNextCursor(page.meta?.nextCursor ?? null)
    }
  }

  return (
    <div className="space-y-3">
      {users.error && (
        <ApiErrorMessage error={users.error} onRetry={() => void users.refetch()} />
      )}
      {users.isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          Loading accounts...
        </p>
      )}
      {!users.isLoading && !users.error && !allUsers.length && (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No accounts match the current filters.
        </p>
      )}
      {allUsers.map((user) => (
        <AdminUserCard
          isSelf={user.id === currentUserId}
          key={`${user.id}:${user.updatedAt}`}
          onDeleted={(deletedId) =>
            setAdditional((current) =>
              current.filter((item) => item.id !== deletedId)
            )
          }
          user={user}
        />
      ))}
      {cursor && (
        <div className="flex justify-center">
          <Button
            disabled={nextPage.isFetching}
            onClick={() => void handleLoadMore()}
            variant="outline"
          >
            {nextPage.isFetching ? "Loading..." : "Load more accounts"}
          </Button>
        </div>
      )}
      {nextPage.error && (
        <ApiErrorMessage
          error={nextPage.error}
          onRetry={() => void handleLoadMore()}
        />
      )}
    </div>
  )
}

export function AdminUsersPanel() {
  const session = authClient.useSession()
  const [search, setSearch] = useState("")
  const [submittedSearch, setSubmittedSearch] = useState("")
  const [role, setRole] = useState<Role | "">("")
  const [status, setStatus] = useState<UserStatus | "">("")
  const params: AdminUserListParams = {
    limit: 10,
    ...(submittedSearch && { search: submittedSearch }),
    ...(role && { role }),
    ...(status && { status }),
  }
  const filterKey = JSON.stringify(params)

  return (
    <section className="w-full space-y-4" aria-labelledby="admin-users-title">
      <Card>
        <CardHeader>
          <CardTitle id="admin-users-title">User management</CardTitle>
          <CardDescription>
            Search and filter accounts, inspect recent order history, update
            roles/statuses, or remove accounts where backend relationships allow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
            onSubmit={(event) => {
              event.preventDefault()
              setSubmittedSearch(search.trim())
            }}
          >
            <label className="relative grid gap-2 text-sm font-medium">
              Search accounts
              <span className="relative">
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  className="pl-9"
                  onChange={(event) => setSearch(event.currentTarget.value)}
                  placeholder="Name, email or phone"
                  value={search}
                />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Role
              <select
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                onChange={(event) =>
                  setRole(event.currentTarget.value as Role | "")
                }
                value={role}
              >
                <option value="">All roles</option>
                <option value="CUSTOMER">Customer</option>
                <option value="PROVIDER">Provider</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Status
              <select
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                onChange={(event) =>
                  setStatus(event.currentTarget.value as UserStatus | "")
                }
                value={status}
              >
                <option value="">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </label>
            <div className="flex items-end">
              <Button type="submit">Search</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <AdminUsersResults
        currentUserId={session.data?.user.id}
        key={filterKey}
        params={params}
      />
    </section>
  )
}
