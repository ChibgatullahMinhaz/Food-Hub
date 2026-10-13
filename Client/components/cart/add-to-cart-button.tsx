"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, LoaderCircle, ShoppingCart } from "lucide-react"
import { ApiErrorMessage } from "@/components/api/api-error-message"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useAddCartItemMutation } from "@/store/api/cart-api"

export function AddToCartButton({
  mealId,
  isAvailable,
}: {
  mealId: string
  isAvailable: boolean
}) {
  const router = useRouter()
  const session = authClient.useSession()
  const [addCartItem, mutation] = useAddCartItemMutation()
  const [added, setAdded] = useState(false)
  const isSignedIn = Boolean(session.data?.user.id)
  const returnTo = `/shop/${encodeURIComponent(mealId)}`

  async function addItem() {
    if (!isSignedIn) {
      router.push(`/login?next=${encodeURIComponent(returnTo)}`)
      return
    }

    setAdded(false)
    const result = await addCartItem({ mealId, quantity: 1 })

    if ("data" in result && result.data) {
      setAdded(true)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        className="h-11 w-full"
        disabled={session.isPending || mutation.isLoading || !isAvailable}
        onClick={() => void addItem()}
        size="lg"
        type="button"
      >
        {mutation.isLoading ? (
          <LoaderCircle aria-hidden="true" className="animate-spin" />
        ) : added ? (
          <Check aria-hidden="true" />
        ) : (
          <ShoppingCart aria-hidden="true" />
        )}
        {mutation.isLoading
          ? "Adding to cart…"
          : !isAvailable
            ? "Currently unavailable"
          : added
            ? "Added to cart"
            : "Add to cart"}
      </Button>
      {added && (
        <p className="text-center text-sm text-primary" role="status">
          Meal added.{" "}
          <Link className="font-semibold underline underline-offset-4" href="/cart">
            View your cart
          </Link>
        </p>
      )}
      {mutation.error && (
        <>
          <ApiErrorMessage error={mutation.error} />
          {"status" in mutation.error && mutation.error.status === 401 && (
            <p className="text-center text-sm">
              <Link
                className="font-semibold text-primary underline underline-offset-4"
                href={`/login?next=${encodeURIComponent(returnTo)}`}
              >
                Sign in again
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  )
}
