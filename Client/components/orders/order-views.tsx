"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  LoaderCircle,
  MapPin,
  Phone,
  RefreshCw,
  ShoppingBag,
} from "lucide-react"
import { ApiErrorMessage } from "@/components/api/api-error-message"
import { OrderReviewAction } from "@/components/reviews/review-section"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import {
  useCancelOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetProviderOrdersQuery,
  useLazyGetMyOrdersQuery,
  useLazyGetProviderOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/store/api/order-api"
import type { OrderStatus } from "@/types/api"
import type { Order as OrderData, OrderListParams } from "@/types/order"

type OrderAudience = "customer" | "provider" | "admin"
const statuses: OrderStatus[] = [
  "PLACED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
]

function formatPrice(value: number | string) {
  const amount = Number(value)

  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 2,
      }).format(amount)
    : "Price unavailable"
}

function formatDate(value: string) {
  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-BD", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
}

function statusLabel(status: OrderStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

function statusClass(status: OrderStatus) {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-800"
    case "CANCELLED":
      return "bg-red-100 text-red-800"
    case "READY":
      return "bg-blue-100 text-blue-800"
    case "PREPARING":
      return "bg-amber-100 text-amber-900"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

function statusProgress(status: OrderStatus) {
  const progression: OrderStatus[] = ["PLACED", "PREPARING", "READY", "DELIVERED"]
  const current = progression.indexOf(status)

  return (
    <ol aria-label="Order progress" className="flex flex-wrap gap-2">
      {progression.map((step, index) => (
        <li
          aria-current={step === status ? "step" : undefined}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            current >= index
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
          key={step}
        >
          {statusLabel(step)}
        </li>
      ))}
      {status === "CANCELLED" && (
        <li className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
          Cancelled
        </li>
      )}
    </ol>
  )
}

function nextProviderStatus(status: OrderStatus): OrderStatus | null {
  if (status === "PLACED") return "PREPARING"
  if (status === "PREPARING") return "READY"
  if (status === "READY") return "DELIVERED"
  return null
}

function orderPath(audience: OrderAudience, id: string) {
  const basePath =
    audience === "customer"
      ? "/customer/orders"
      : audience === "admin"
        ? "/admin/orders"
        : "/seller/orders"

  return `${basePath}/${encodeURIComponent(id)}`
}

function isTerminal(status: OrderStatus) {
  return status === "DELIVERED" || status === "CANCELLED"
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(status)}`}>
      {statusLabel(status)}
    </span>
  )
}

function OrderListCard({
  order,
  audience,
  updating,
  onAdvance,
}: {
  order: OrderData
  audience: OrderAudience
  updating: boolean
  onAdvance?: (order: OrderData, status: OrderStatus) => void
}) {
  const itemsLabel = order.items
    .map((item) => `${item.quantity} × ${item.meal.name}`)
    .join(", ")
  const nextStatus = nextProviderStatus(order.status)

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <Link
              className="font-semibold tracking-tight hover:text-primary hover:underline"
              href={orderPath(audience, order.id)}
            >
              {order.orderNumber}
            </Link>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
          {itemsLabel || "No item details"}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="space-y-1">
            {audience !== "customer" && order.customer && (
              <p className="text-sm font-medium">
                {order.customer.name}
                <span className="ml-2 font-normal text-muted-foreground">
                  {order.customer.email}
                </span>
              </p>
            )}
            <p className="text-sm font-semibold">
              {formatPrice(order.totalAmount)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {audience !== "customer" && nextStatus && onAdvance && (
              <Button
                disabled={updating}
                onClick={() => onAdvance(order, nextStatus)}
                size="sm"
                variant="outline"
              >
                {updating ? (
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                ) : (
                  <ArrowRight aria-hidden="true" />
                )}
                Mark {statusLabel(nextStatus).toLowerCase()}
              </Button>
            )}
            <Link
              className="inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition-colors hover:bg-muted"
              href={orderPath(audience, order.id)}
            >
              View details
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OrderList({ audience }: { audience: OrderAudience }) {
  const session = authClient.useSession()
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL")

  if (session.isPending) {
    return <OrdersLoading />
  }

  if (!session.data?.user.id) {
    return <SignInForOrders audience={audience} />
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="grid gap-2 text-sm font-medium">
          Filter by status
          <select
            className="h-10 min-w-48 rounded-lg border border-input bg-background px-3 text-sm"
            onChange={(event) =>
              setStatus(event.target.value as OrderStatus | "ALL")
            }
            value={status}
          >
            <option value="ALL">All orders</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {statusLabel(item)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <OrderListResults audience={audience} key={status} status={status} />
    </div>
  )
}

function OrderListResults({
  audience,
  status,
}: {
  audience: OrderAudience
  status: OrderStatus | "ALL"
}) {
  const params: OrderListParams = {
    limit: 10,
    ...(status !== "ALL" && { status }),
  }
  const customerOrders = useGetMyOrdersQuery(params, {
    skip: audience !== "customer",
  })
  const providerOrders = useGetProviderOrdersQuery(params, {
    skip: audience === "customer",
  })
  const [loadMyNext, myNext] = useLazyGetMyOrdersQuery()
  const [loadProviderNext, providerNext] = useLazyGetProviderOrdersQuery()
  const [updateOrderStatus, statusMutation] = useUpdateOrderStatusMutation()
  const [additionalOrders, setAdditionalOrders] = useState<OrderData[]>([])
  const [nextCursor, setNextCursor] = useState<string | null | undefined>()
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const result = audience === "customer" ? customerOrders : providerOrders
  const next = audience === "customer" ? myNext : providerNext
  const refetchOrders = result.refetch
  const rows = [...(result.data?.data ?? []), ...additionalOrders]
  const cursor =
    nextCursor === undefined ? result.data?.meta?.nextCursor : nextCursor
  const hasActiveOrder = rows.some((order) => !isTerminal(order.status))

  useEffect(() => {
    if (!hasActiveOrder) {
      return
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refetchOrders()
      }
    }, 30_000)

    return () => window.clearInterval(interval)
  }, [hasActiveOrder, refetchOrders])

  async function loadMore() {
    if (!cursor || next.isFetching) return

    const page =
      audience === "customer"
        ? await loadMyNext({ ...params, cursor })
        : await loadProviderNext({ ...params, cursor })

    if ("data" in page && page.data) {
      const newOrders = page.data.data
      setAdditionalOrders((current) => {
        const knownIds = new Set(current.map((order) => order.id))
        return [...current, ...newOrders.filter((order) => !knownIds.has(order.id))]
      })
      setNextCursor(page.data.meta?.nextCursor ?? null)
    }
  }

  async function advanceOrder(order: OrderData, nextStatus: OrderStatus) {
    setUpdatingOrderId(order.id)
    await updateOrderStatus({ id: order.id, status: nextStatus })
    setUpdatingOrderId(null)
  }

  if (result.isLoading || result.isUninitialized) {
    return <OrdersLoading />
  }

  if (result.error) {
    return (
      <ApiErrorMessage
        error={result.error}
        onRetry={() => void result.refetch()}
      />
    )
  }

  if (!rows.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary">
            <ShoppingBag aria-hidden="true" className="size-6" />
          </span>
          <h2 className="text-lg font-semibold">
            {status === "ALL"
              ? "No orders yet"
              : `No ${statusLabel(status).toLowerCase()} orders`}
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {audience === "customer"
              ? "Once you place an order, you can track it here."
              : "Orders from your restaurant will appear here."}
          </p>
          {audience === "customer" && (
            <Link
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
              href="/shop"
            >
              Browse meals
            </Link>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          disabled={result.isFetching}
          onClick={() => void result.refetch()}
          size="sm"
          variant="outline"
        >
          <RefreshCw
            aria-hidden="true"
            className={result.isFetching ? "animate-spin" : ""}
          />
          Refresh
        </Button>
      </div>
      {statusMutation.error && <ApiErrorMessage error={statusMutation.error} />}
      {next.error && (
        <ApiErrorMessage error={next.error} onRetry={() => void loadMore()} />
      )}
      {rows.map((order) => (
        <OrderListCard
          audience={audience}
          key={order.id}
          onAdvance={audience !== "customer" ? advanceOrder : undefined}
          order={order}
          updating={statusMutation.isLoading && updatingOrderId === order.id}
        />
      ))}
      {cursor && (
        <div className="flex justify-center">
          <Button
            disabled={next.isFetching || result.isFetching}
            onClick={() => void loadMore()}
            variant="outline"
          >
            {next.isFetching ? "Loading orders…" : "Load more orders"}
          </Button>
        </div>
      )}
      {hasActiveOrder && (
        <p className="text-center text-xs text-muted-foreground">
          Orders refresh every 30 seconds while this page is open.
        </p>
      )}
    </div>
  )
}

function OrdersLoading() {
  return (
    <div
      aria-label="Loading orders"
      className="grid gap-4"
    >
      {[0, 1, 2].map((item) => (
        <div className="h-36 animate-pulse rounded-2xl bg-muted" key={item} />
      ))}
    </div>
  )
}

function SignInForOrders({ audience }: { audience: OrderAudience }) {
  const router = useRouter()
  const destination =
    audience === "customer"
      ? "/customer/orders"
      : audience === "admin"
        ? "/admin/orders"
        : "/seller/orders"

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader className="items-center text-center">
        <CardTitle>Sign in to view orders</CardTitle>
        <CardDescription>
          Order history and fulfillment details are linked to your FoodHub
          account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center gap-3">
        <Button
          onClick={() =>
            router.push(`/login?next=${encodeURIComponent(destination)}`)
          }
          type="button"
        >
          Sign in
        </Button>
        {audience === "customer" && (
          <Link
            className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium hover:bg-muted"
            href="/shop"
          >
            Browse meals
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

export function CustomerOrders() {
  return <OrderList audience="customer" />
}

export function ProviderOrders() {
  return <OrderList audience="provider" />
}

export function AdminOrders() {
  return <OrderList audience="admin" />
}

export function OrderDetailView({
  id,
  audience,
}: {
  id: string
  audience: OrderAudience
}) {
  const session = authClient.useSession()
  const result = useGetOrderByIdQuery(id, {
    skip: session.isPending || !session.data?.user.id,
  })

  if (session.isPending || (session.data && result.isLoading)) {
    return <OrdersLoading />
  }

  if (!session.data) {
    return <SignInForOrders audience={audience} />
  }

  if (result.isLoading) {
    return <OrdersLoading />
  }

  if (result.error) {
    if ("status" in result.error && result.error.status === 404) {
      return <NotFoundOrder audience={audience} />
    }

    return (
      <ApiErrorMessage
        error={result.error}
        onRetry={() => void result.refetch()}
      />
    )
  }

  const order = result.data?.data

  if (!order) {
    return <NotFoundOrder audience={audience} />
  }

  return (
    <LoadedOrderDetail
      audience={audience}
      order={order}
      refresh={result.refetch}
    />
  )
}

function LoadedOrderDetail({
  audience,
  order,
  refresh,
}: {
  audience: OrderAudience
  order: OrderData
  refresh: () => unknown
}) {
  const [cancelOrder, cancel] = useCancelOrderMutation()
  const [advanceStatus, advance] = useUpdateOrderStatusMutation()
  const isWorking = cancel.isLoading || advance.isLoading
  const nextStatus = nextProviderStatus(order.status)

  useEffect(() => {
    if (isTerminal(order.status)) {
      return
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refresh()
      }
    }, 30_000)

    return () => window.clearInterval(interval)
  }, [order.status, refresh])

  async function handleCancel() {
    if (
      order.status === "PLACED" &&
      window.confirm(`Cancel order ${order.orderNumber}?`)
    ) {
      await cancelOrder(order.id)
    }
  }

  async function handleAdvance() {
    if (nextStatus) {
      await advanceStatus({ id: order.id, status: nextStatus })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            href={
              audience === "customer"
                ? "/orders"
                : audience === "admin"
                  ? "/admin/orders"
                  : "/seller/orders"
            }
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {audience === "customer" ? "Order history" : "Back to orders"}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Order {order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order progress</CardTitle>
          <CardDescription>
            Updates are based on the restaurant’s current order status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {statusProgress(order.status)}
          {audience === "customer" && order.status === "PLACED" && (
            <Button
              disabled={isWorking}
              onClick={() => void handleCancel()}
              variant="destructive"
            >
              {cancel.isLoading && (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              )}
              Cancel order
            </Button>
          )}
          {audience !== "customer" && nextStatus && (
            <Button
              disabled={isWorking}
              onClick={() => void handleAdvance()}
              variant="outline"
            >
              {advance.isLoading ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              ) : (
                <ArrowRight aria-hidden="true" />
              )}
              Mark {statusLabel(nextStatus).toLowerCase()}
            </Button>
          )}
          {cancel.error && <ApiErrorMessage error={cancel.error} />}
          {advance.error && <ApiErrorMessage error={advance.error} />}
          {cancel.isSuccess && (
            <p className="text-sm font-medium text-primary" role="status">
              Order cancelled.
            </p>
          )}
          {advance.isSuccess && (
            <p className="text-sm font-medium text-primary" role="status">
              Order status updated.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Items</h2>
          {order.items.map((item) => (
            <OrderItemRow
              canReview={audience === "customer"}
              item={item}
              key={item.id}
              orderId={order.id}
            />
          ))}
        </section>
        <Card>
          <CardHeader>
            <CardTitle>Delivery details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {order.customer && (
              <div>
                <p className="font-semibold">{order.customer.name}</p>
                <p className="text-muted-foreground">{order.customer.email}</p>
              </div>
            )}
            <p className="flex items-start gap-2">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{order.deliveryAddress}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone aria-hidden="true" className="size-4 shrink-0 text-primary" />
              {order.contactPhone}
            </p>
            <p className="flex items-center gap-2">
              <Clock3 aria-hidden="true" className="size-4 shrink-0 text-primary" />
              {order.paymentMethod.replace(/_/g, " ").toLowerCase()}
            </p>
            {order.specialInstructions && (
              <p className="rounded-lg bg-muted p-3 leading-6">
                {order.specialInstructions}
              </p>
            )}
            <div className="flex justify-between border-t pt-4 font-semibold">
              <span>Order total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function OrderItemRow({
  item,
  orderId,
  canReview,
}: {
  item: OrderData["items"][number]
  orderId: string
  canReview: boolean
}) {
  const image = item.meal.images[0]

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <Link
            aria-label={`View ${item.meal.name}`}
            className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary"
            href={`/shop/${item.meal.id}`}
          >
            {image && (
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url("${image}")` }}
              />
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              className="font-medium hover:text-primary hover:underline"
              href={`/shop/${item.meal.id}`}
            >
              {item.meal.name}
            </Link>
            <p className="text-sm text-muted-foreground">
              {item.quantity} × {formatPrice(item.price)}
            </p>
          </div>
          <strong className="shrink-0">
            {formatPrice(Number(item.price) * item.quantity)}
          </strong>
        </CardContent>
      </Card>
      {canReview && (
        <div className="pl-4">
          <OrderReviewAction mealId={item.mealId} orderId={orderId} />
        </div>
      )}
    </div>
  )
}

function NotFoundOrder({ audience }: { audience: OrderAudience }) {
  const backHref =
    audience === "customer"
      ? "/orders"
      : audience === "admin"
        ? "/admin/orders"
        : "/seller/orders"

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-xl font-semibold">Order not found</p>
        <p className="text-sm text-muted-foreground">
          This order may have been removed or is not available to this account.
        </p>
        <Link
          className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium hover:bg-muted"
          href={backHref}
        >
          {audience === "customer" ? "Back to order history" : "Back to orders"}
        </Link>
      </CardContent>
    </Card>
  )
}
