"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react"
import { ApiErrorMessage } from "@/components/api/api-error-message"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import type { SerializedError } from "@reduxjs/toolkit"
import {
  useClearCartMutation,
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/store/api/cart-api"
import type { CartItem } from "@/types/cart"

function priceLabel(price: number | string) {
  const value = Number(price)

  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 2,
      }).format(value)
    : "Price unavailable"
}

function isUnauthorized(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 401
  )
}

type RequestError = FetchBaseQueryError | SerializedError | undefined

function CartRequestError({
  error,
  onRetry,
}: {
  error: RequestError
  onRetry?: () => void
}) {
  const router = useRouter()

  return (
    <div className="space-y-3">
      <ApiErrorMessage error={error} onRetry={onRetry} />
      {isUnauthorized(error) && (
        <Button
          onClick={() => router.push("/login?next=%2Fcart")}
          type="button"
          variant="outline"
        >
          Sign in again
        </Button>
      )}
    </div>
  )
}

export function CustomerCart() {
  const router = useRouter()
  const session = authClient.useSession()
  const isSignedIn = Boolean(session.data?.user.id)
  const cart = useGetCartQuery(undefined, { skip: !isSignedIn })
  const [updateItem, updateState] = useUpdateCartItemMutation()
  const [removeItem, removeState] = useRemoveCartItemMutation()
  const [clearCart, clearState] = useClearCartMutation()

  if (session.isPending) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center gap-3 text-muted-foreground">
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        Checking your sign-in…
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader className="items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary">
            <ShoppingBag aria-hidden="true" className="size-6" />
          </span>
          <CardTitle>Sign in to see your cart</CardTitle>
          <CardDescription>
            Your cart is saved to your FoodHub account and will be ready when
            you return.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => router.push("/login?next=%2Fcart")}
            type="button"
          >
            Sign in
          </Button>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"
            href="/shop"
          >
            Browse meals
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (cart.isLoading || cart.isUninitialized) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center gap-3 text-muted-foreground">
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        Loading your cart…
      </div>
    )
  }

  if (cart.error) {
    return (
      <CartRequestError
        error={cart.error}
        onRetry={() => void cart.refetch()}
      />
    )
  }

  const currentCart = cart.data?.data
  const items = currentCart?.items ?? []

  if (!items.length) {
    return (
      <Card className="mx-auto max-w-xl border-dashed">
        <CardHeader className="items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary">
            <ShoppingBag aria-hidden="true" className="size-6" />
          </span>
          <CardTitle>Your cart is empty</CardTitle>
          <CardDescription>
            Find something delicious and add it to your cart.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            href="/shop"
          >
            Explore meals
          </Link>
        </CardContent>
      </Card>
    )
  }

  async function changeQuantity(item: CartItem, quantity: number) {
    await updateItem({ itemId: item.id, quantity })
  }

  async function remove(itemId: string) {
    await removeItem(itemId)
  }

  async function clear() {
    if (window.confirm("Remove all items from your cart?")) {
      await clearCart()
    }
  }

  const isUpdating = updateState.isLoading || removeState.isLoading || clearState.isLoading

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section aria-label="Cart items" className="space-y-4">
        {items.map((item) => (
          <CartItemRow
            item={item}
            key={item.id}
            isUpdating={isUpdating}
            onChangeQuantity={(quantity) => void changeQuantity(item, quantity)}
            onRemove={() => void remove(item.id)}
          />
        ))}
      </section>
      <aside className="lg:sticky lg:top-6">
        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <CardDescription>
              {items.reduce((count, item) => count + item.quantity, 0)} items in
              your cart
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex justify-between border-t pt-4 text-base font-semibold">
              <span>Subtotal</span>
              <span>{priceLabel(currentCart?.subtotal ?? 0)}</span>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Delivery fees and any applicable charges are calculated at
              checkout.
            </p>
            <Link
              className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
              href="/checkout"
            >
              Continue to checkout
            </Link>
            <Button
              className="w-full"
              disabled={clearState.isLoading}
              onClick={() => void clear()}
              variant="outline"
            >
              {clearState.isLoading ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              ) : (
                <Trash2 aria-hidden="true" />
              )}
              Clear cart
            </Button>
            <Link
              className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
              href="/shop"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Continue browsing
            </Link>
          </CardContent>
        </Card>
        {updateState.error && (
          <div className="mt-4">
            <CartRequestError error={updateState.error} />
          </div>
        )}
        {removeState.error && (
          <div className="mt-4">
            <CartRequestError error={removeState.error} />
          </div>
        )}
        {clearState.error && (
          <div className="mt-4">
            <CartRequestError error={clearState.error} />
          </div>
        )}
      </aside>
    </div>
  )
}

function CartItemRow({
  item,
  isUpdating,
  onChangeQuantity,
  onRemove,
}: {
  item: CartItem
  isUpdating: boolean
  onChangeQuantity: (quantity: number) => void
  onRemove: () => void
}) {
  const image = item.meal.images[0]
  const providerPath = item.meal.provider?.id
    ? `/providers/${item.meal.provider.id}`
    : item.meal.providerId
      ? `/providers/${item.meal.providerId}`
      : undefined
  const itemSubtotal = Number(item.meal.price) * item.quantity

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <Link
          aria-label={`View ${item.meal.name}`}
          className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_40%_35%,#fff6e8,#e6eee5)] sm:size-28"
          href={`/shop/${item.meal.id}`}
        >
          {image ? (
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${image}")` }}
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-xs text-primary/70">
              No photo
            </span>
          )}
        </Link>
        <div className="min-w-0 flex-1 space-y-1">
          <Link
            className="font-semibold hover:text-primary hover:underline"
            href={`/shop/${item.meal.id}`}
          >
            {item.meal.name}
          </Link>
          {item.meal.provider && providerPath && (
            <Link
              className="block truncate text-sm text-muted-foreground hover:text-primary"
              href={providerPath}
            >
              {item.meal.provider.restaurantName}
            </Link>
          )}
          {item.meal.isAvailable === false && (
            <p className="text-sm font-medium text-destructive">
              Currently unavailable
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {priceLabel(item.meal.price)} each
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Button
              aria-label={`Decrease ${item.meal.name} quantity`}
              disabled={isUpdating || item.quantity <= 1}
              onClick={() => onChangeQuantity(item.quantity - 1)}
              size="icon"
              variant="outline"
            >
              <Minus aria-hidden="true" />
            </Button>
            <span
              aria-label={`Quantity ${item.quantity}`}
              className="min-w-8 text-center text-sm font-semibold"
              aria-live="polite"
            >
              {item.quantity}
            </span>
            <Button
              aria-label={`Increase ${item.meal.name} quantity`}
              disabled={isUpdating}
              onClick={() => onChangeQuantity(item.quantity + 1)}
              size="icon"
              variant="outline"
            >
              <Plus aria-hidden="true" />
            </Button>
            <Button
              aria-label={`Remove ${item.meal.name} from cart`}
              className="ml-auto"
              disabled={isUpdating}
              onClick={onRemove}
              size="icon"
              variant="ghost"
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        </div>
        <strong className="shrink-0 text-base">
          {priceLabel(itemSubtotal)}
        </strong>
      </CardContent>
    </Card>
  )
}
