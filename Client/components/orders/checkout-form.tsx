"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoaderCircle, MapPin, ShoppingBag } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { authClient } from "@/lib/auth-client"
import { useGetCartQuery } from "@/store/api/cart-api"
import { useCreateOrderMutation } from "@/store/api/order-api"
import type { CartItem } from "@/types/cart"

function priceLabel(price: number | string) {
  const amount = Number(price)

  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 2,
      }).format(amount)
    : "Price unavailable"
}

export function CheckoutForm() {
  const router = useRouter()
  const session = authClient.useSession()
  const signedIn = Boolean(session.data?.user.id)
  const cart = useGetCartQuery(undefined, { skip: !signedIn })
  const [createOrder, order] = useCreateOrderMutation()
  const [validationMessage, setValidationMessage] = useState("")

  async function submitCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationMessage("")

    const form = event.currentTarget
    const values = new FormData(form)
    const deliveryAddress = String(values.get("deliveryAddress") ?? "").trim()
    const contactPhone = String(values.get("contactPhone") ?? "").trim()
    const specialInstructions = String(
      values.get("specialInstructions") ?? ""
    ).trim()

    if (deliveryAddress.length < 5) {
      setValidationMessage("Delivery address must be at least 5 characters.")
      return
    }

    if (contactPhone.length < 10) {
      setValidationMessage("Contact phone must be at least 10 characters.")
      return
    }

    if (!cart.data?.data.items.length) {
      setValidationMessage("Your cart is empty. Add a meal before checking out.")
      return
    }

    const result = await createOrder({
      deliveryAddress,
      contactPhone,
      paymentMethod: "CASH_ON_DELIVERY",
      ...(specialInstructions && { specialInstructions }),
    })

    if ("data" in result && result.data) {
      router.replace(
        `/customer/orders/${encodeURIComponent(result.data.data.id)}`
      )
    }
  }

  if (session.isPending) {
    return <CheckoutLoading message="Checking your sign-in…" />
  }

  if (!signedIn) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader className="items-center text-center">
          <CardTitle>Sign in to check out</CardTitle>
          <CardDescription>
            Your order is placed from your account’s saved cart.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-3">
          <Button
            onClick={() => router.push("/login?next=%2Fcheckout")}
            type="button"
          >
            Sign in
          </Button>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium hover:bg-muted"
            href="/cart"
          >
            View cart
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (cart.isLoading || cart.isUninitialized) {
    return <CheckoutLoading message="Loading your cart…" />
  }

  if (cart.error) {
    return (
      <div className="space-y-4">
        <ApiErrorMessage
          error={cart.error}
          onRetry={() => void cart.refetch()}
        />
        {"status" in cart.error && cart.error.status === 401 && (
          <Button
            onClick={() => router.push("/login?next=%2Fcheckout")}
            type="button"
            variant="outline"
          >
            Sign in again
          </Button>
        )}
      </div>
    )
  }

  const cartItems = cart.data?.data.items ?? []

  if (!cartItems.length) {
    return (
      <Card className="mx-auto max-w-xl border-dashed">
        <CardHeader className="items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary">
            <ShoppingBag aria-hidden="true" className="size-6" />
          </span>
          <CardTitle>Your cart is empty</CardTitle>
          <CardDescription>
            Add a meal before continuing to checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            href="/shop"
          >
            Browse meals
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <form
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"
      onSubmit={(event) => void submitCheckout(event)}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-5 text-primary" />
              Delivery details
            </CardTitle>
            <CardDescription>
              Tell the kitchen where to deliver your order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="grid gap-2 text-sm font-medium" htmlFor="deliveryAddress">
              Delivery address
              <Textarea
                autoComplete="street-address"
                className="min-h-24 resize-y"
                id="deliveryAddress"
                maxLength={500}
                minLength={5}
                name="deliveryAddress"
                placeholder="House, road, area, city"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor="contactPhone">
              Contact phone
              <Input
                autoComplete="tel"
                className="h-10"
                id="contactPhone"
                maxLength={30}
                minLength={10}
                name="contactPhone"
                placeholder="01700000000"
                required
                type="tel"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor="specialInstructions">
              Special instructions <span className="font-normal text-muted-foreground">(optional)</span>
              <Textarea
                className="min-h-20 resize-y"
                id="specialInstructions"
                maxLength={1000}
                name="specialInstructions"
                placeholder="Anything the restaurant or delivery person should know?"
              />
            </label>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment method</CardTitle>
            <CardDescription>
              Pay in cash when your order arrives.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-default items-center gap-3 rounded-xl border p-4">
              <input
                checked
                className="size-4 accent-primary"
                name="paymentMethod"
                readOnly
                type="radio"
                value="CASH_ON_DELIVERY"
              />
              <span>
                <span className="block text-sm font-medium">
                  Cash on delivery
                </span>
                <span className="text-xs text-muted-foreground">
                  Online payment is not available yet.
                </span>
              </span>
            </label>
          </CardContent>
        </Card>
      </div>
      <aside className="lg:sticky lg:top-6">
        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <CardDescription>
              {cartItems.reduce((count, item) => count + item.quantity, 0)} items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="max-h-72 space-y-4 overflow-y-auto">
              {cartItems.map((item) => (
                <CheckoutItem item={item} key={item.id} />
              ))}
            </div>
            <div className="flex justify-between border-t pt-4 font-semibold">
              <span>Subtotal</span>
              <span>{priceLabel(cart.data?.data.subtotal ?? 0)}</span>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              The final total is calculated by the server from current menu
              prices. Delivery fees, if applicable, are not included.
            </p>
            {validationMessage && (
              <p className="text-sm text-destructive" role="alert">
                {validationMessage}
              </p>
            )}
            {order.error && (
              <div className="space-y-2">
                <ApiErrorMessage error={order.error} />
                {"status" in order.error && order.error.status === 401 && (
                  <Button
                    className="w-full"
                    onClick={() => router.push("/login?next=%2Fcheckout")}
                    type="button"
                    variant="outline"
                  >
                    Sign in again
                  </Button>
                )}
                <p className="text-xs leading-5 text-muted-foreground">
                  If you are unsure whether your order was placed, check{" "}
                  <Link className="font-medium underline" href="/orders">
                    order history
                  </Link>{" "}
                  before trying again.
                </p>
              </div>
            )}
            <Button
              className="h-11 w-full"
              disabled={order.isLoading}
              type="submit"
            >
              {order.isLoading ? (
                <>
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                  Placing order…
                </>
              ) : (
                "Place order"
              )}
            </Button>
            <Link
              className="block text-center text-sm font-medium text-primary hover:underline"
              href="/cart"
            >
              Back to cart
            </Link>
          </CardContent>
        </Card>
      </aside>
    </form>
  )
}

function CheckoutItem({ item }: { item: CartItem }) {
  const image = item.meal.images[0]

  return (
    <div className="flex items-center gap-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
        {image && (
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${image}")` }}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.meal.name}</p>
        <p className="text-xs text-muted-foreground">
          {item.quantity} × {priceLabel(item.meal.price)}
        </p>
      </div>
      <strong className="shrink-0 text-sm">
        {priceLabel(Number(item.meal.price) * item.quantity)}
      </strong>
    </div>
  )
}

function CheckoutLoading({ message }: { message: string }) {
  return (
    <div className="flex min-h-[45vh] items-center justify-center gap-3 text-muted-foreground">
      <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
      {message}
    </div>
  )
}
