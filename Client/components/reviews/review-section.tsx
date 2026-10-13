"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { LoaderCircle, Star } from "lucide-react"
import { ApiErrorMessage } from "@/components/api/api-error-message"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { authClient } from "@/lib/auth-client"
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useGetMealReviewsQuery,
  useGetProviderReviewsQuery,
  useLazyGetMealReviewsQuery,
  useLazyGetProviderReviewsQuery,
  useUpdateReviewMutation,
} from "@/store/api/review-api"
import { useGetCurrentProfileQuery } from "@/store/api/profile-api"
import type { Review } from "@/types/review"

type ReviewTarget = "meal" | "provider"

function RatingStars({
  rating,
  label,
}: {
  rating: number
  label: string
}) {
  return (
    <span aria-label={label} className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          aria-hidden="true"
          className={`size-4 ${
            value <= rating
              ? "fill-amber-400 text-amber-500"
              : "text-muted-foreground/40"
          }`}
          key={value}
        />
      ))}
    </span>
  )
}

function RatingInput({
  rating,
  onChange,
  disabled,
}: {
  rating: number
  onChange: (rating: number) => void
  disabled: boolean
}) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-medium">Your rating</legend>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            aria-label={`Rate ${value} out of 5`}
            aria-pressed={rating === value}
            className="rounded-sm p-1 text-amber-500 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            key={value}
            onClick={() => onChange(value)}
            type="button"
          >
            <Star
              aria-hidden="true"
              className={`size-6 ${
                value <= rating ? "fill-amber-400" : "text-muted-foreground/40"
              }`}
            />
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function ReviewComposer({
  mealId,
  orderId,
  onCreated,
}: {
  mealId: string
  orderId?: string
  onCreated?: () => void
}) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [createReview, result] = useCreateReviewMutation()
  const disabled = result.isLoading || comment.trim().length < 3

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled) return

    const response = await createReview({
      mealId,
      orderId,
      rating,
      comment: comment.trim(),
    })

    if ("data" in response) {
      setComment("")
      setRating(5)
      onCreated?.()
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <RatingInput
        disabled={result.isLoading}
        onChange={setRating}
        rating={rating}
      />
      <label className="block space-y-2 text-sm font-medium">
        <span>Your review</span>
        <Textarea
          aria-label="Your review"
          maxLength={2000}
          minLength={3}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share what you enjoyed about this dish"
          required
          value={comment}
        />
      </label>
      {result.error && <ApiErrorMessage error={result.error} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Please write at least 3 characters.
        </p>
        <Button disabled={disabled} type="submit">
          {result.isLoading && (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          )}
          Post review
        </Button>
      </div>
    </form>
  )
}

function ReviewCard({ review, currentUserId }: {
  review: Review
  currentUserId?: string
}) {
  const [editing, setEditing] = useState(false)
  const [rating, setRating] = useState(review.rating)
  const [comment, setComment] = useState(review.comment)
  const [updateReview, update] = useUpdateReviewMutation()
  const [deleteReview, deletion] = useDeleteReviewMutation()
  const isOwner = Boolean(currentUserId && currentUserId === review.customer.id)

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (comment.trim().length < 3 || update.isLoading) return

    const response = await updateReview({
      id: review.id,
      rating,
      comment: comment.trim(),
    })

    if ("data" in response) {
      setEditing(false)
    }
  }

  async function remove() {
    if (
      isOwner &&
      window.confirm("Delete your review? This cannot be undone.")
    ) {
      await deleteReview(review.id)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="font-semibold">{review.customer.name}</p>
            <p className="text-xs text-muted-foreground">
              {new Intl.DateTimeFormat("en-BD", {
                dateStyle: "medium",
              }).format(new Date(review.createdAt))}
            </p>
          </div>
          <RatingStars
            label={`${review.rating} out of 5 stars`}
            rating={review.rating}
          />
        </div>
        {review.meal && (
          <p className="text-sm">
            Meal:{" "}
            <Link
              className="font-medium text-primary hover:underline"
              href={`/shop/${encodeURIComponent(review.meal.id)}`}
            >
              {review.meal.name}
            </Link>
          </p>
        )}
        {editing ? (
          <form className="space-y-4" onSubmit={save}>
            <RatingInput
              disabled={update.isLoading}
              onChange={setRating}
              rating={rating}
            />
            <label className="block space-y-2 text-sm font-medium">
              <span>Edit your review</span>
              <Textarea
                maxLength={2000}
                minLength={3}
                onChange={(event) => setComment(event.target.value)}
                required
                value={comment}
              />
            </label>
            {update.error && <ApiErrorMessage error={update.error} />}
            <div className="flex gap-2">
              <Button
                disabled={update.isLoading || comment.trim().length < 3}
                size="sm"
                type="submit"
              >
                Save changes
              </Button>
              <Button
                disabled={update.isLoading}
                onClick={() => {
                  setRating(review.rating)
                  setComment(review.comment)
                  setEditing(false)
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {review.comment}
          </p>
        )}
        {isOwner && !editing && (
          <div className="flex gap-2">
            <Button
              onClick={() => setEditing(true)}
              size="sm"
              type="button"
              variant="outline"
            >
              Edit
            </Button>
            <Button
              disabled={deletion.isLoading}
              onClick={() => void remove()}
              size="sm"
              type="button"
              variant="destructive"
            >
              {deletion.isLoading && (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              )}
              Delete
            </Button>
          </div>
        )}
        {deletion.error && <ApiErrorMessage error={deletion.error} />}
      </CardContent>
    </Card>
  )
}

export function ReviewSection({
  target,
  id,
}: {
  target: ReviewTarget
  id: string
}) {
  // Remount on target/id change so paging state (additionalReviews/nextCursor)
  // always starts fresh instead of resetting it from an effect.
  return <ReviewSectionBody id={id} key={`${target}-${id}`} target={target} />
}

function ReviewSectionBody({
  target,
  id,
}: {
  target: ReviewTarget
  id: string
}) {
  const session = authClient.useSession()
  const profile = useGetCurrentProfileQuery(undefined, {
    skip: session.isPending || !session.data?.user.id,
  })
  const mealQuery = useGetMealReviewsQuery(
    { id, limit: 10 },
    { skip: target !== "meal" },
  )
  const providerQuery = useGetProviderReviewsQuery(
    { id, limit: 10 },
    { skip: target !== "provider" },
  )
  const [loadMealReviews, moreMeal] = useLazyGetMealReviewsQuery()
  const [loadProviderReviews, moreProvider] = useLazyGetProviderReviewsQuery()
  const [additionalReviews, setAdditionalReviews] = useState<Review[]>([])
  const [nextCursor, setNextCursor] = useState<string | null | undefined>()
  const result = target === "meal" ? mealQuery : providerQuery
  const more = target === "meal" ? moreMeal : moreProvider
  const reviews = [...(result.data?.data ?? []), ...additionalReviews]
  const cursor =
    nextCursor === undefined ? result.data?.meta?.nextCursor : nextCursor

  async function loadMore() {
    if (!cursor || more.isFetching) return

    const response =
      target === "meal"
        ? await loadMealReviews({ id, cursor, limit: 10 })
        : await loadProviderReviews({ id, cursor, limit: 10 })

    if ("data" in response && response.data) {
      const page = response.data
      setAdditionalReviews((current) => {
        const knownIds = new Set([
          ...(result.data?.data ?? []),
          ...current,
        ].map((review) => review.id))
        return [
          ...current,
          ...page.data.filter((review) => !knownIds.has(review.id)),
        ]
      })
      setNextCursor(page.meta?.nextCursor ?? null)
    }
  }

  return (
    <section aria-labelledby={`reviews-${target}-${id}`} className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            From the community
          </p>
          <h2
            className="mt-1 text-2xl font-semibold"
            id={`reviews-${target}-${id}`}
          >
            {target === "meal" ? "Meal reviews" : "Restaurant reviews"}
          </h2>
        </div>
        {result.data?.meta && (
          <div className="flex items-center gap-2 text-sm">
            <RatingStars
              label={`${result.data.meta.averageRating} out of 5 average rating`}
              rating={Math.round(result.data.meta.averageRating)}
            />
            <span className="font-semibold">
              {result.data.meta.averageRating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              ({result.data.meta.totalReviews}{" "}
              {result.data.meta.totalReviews === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {target === "meal" && (
        <Card>
          <CardHeader>
            <CardTitle>Share your experience</CardTitle>
            <CardDescription>
              Reviews are tied to this meal. An order is optional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {session.isPending ? (
              <p className="text-sm text-muted-foreground">
                Checking your account…
              </p>
            ) : !session.data?.user.id ? (
              <p className="text-sm text-muted-foreground">
                <Link
                  className="font-medium text-primary hover:underline"
                  href={`/login?next=${encodeURIComponent(`/shop/${id}`)}`}
                >
                  Sign in
                </Link>{" "}
                as a customer to post a review.
              </p>
            ) : profile.isLoading ? (
              <p className="text-sm text-muted-foreground">
                Checking review permissions…
              </p>
            ) : profile.error ? (
              <ApiErrorMessage
                error={profile.error}
                onRetry={() => void profile.refetch()}
              />
            ) : profile.data?.data.role === "CUSTOMER" ? (
              <ReviewComposer mealId={id} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Only customer accounts can post meal reviews.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {result.isLoading ? (
        <div
          aria-label="Loading reviews"
          className="h-32 animate-pulse rounded-2xl bg-muted"
        />
      ) : result.error ? (
        <ApiErrorMessage
          error={result.error}
          onRetry={() => void result.refetch()}
        />
      ) : !reviews.length ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No reviews yet. Be the first to share your experience.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard
              currentUserId={session.data?.user.id}
              key={review.id}
              review={review}
            />
          ))}
        </div>
      )}

      {more.error && (
        <ApiErrorMessage error={more.error} onRetry={() => void loadMore()} />
      )}
      {cursor && (
        <div className="flex justify-center">
          <Button
            disabled={more.isFetching}
            onClick={() => void loadMore()}
            variant="outline"
          >
            {more.isFetching ? "Loading reviews…" : "Load more reviews"}
          </Button>
        </div>
      )}
    </section>
  )
}

export function OrderReviewAction({
  mealId,
  orderId,
}: {
  mealId: string
  orderId: string
}) {
  const session = authClient.useSession()
  const profile = useGetCurrentProfileQuery(undefined, {
    skip: session.isPending || !session.data?.user.id,
  })
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const returnTo = `/orders/${encodeURIComponent(orderId)}`

  if (session.isPending) {
    return <p className="text-xs text-muted-foreground">Checking account…</p>
  }

  if (!session.data?.user.id) {
    return (
      <Link
        className="text-sm font-medium text-primary hover:underline"
        href={`/login?next=${encodeURIComponent(returnTo)}`}
      >
        Sign in to review
      </Link>
    )
  }

  if (profile.isLoading) {
    return <p className="text-xs text-muted-foreground">Checking permissions…</p>
  }

  if (profile.error) {
    return (
      <ApiErrorMessage
        error={profile.error}
        onRetry={() => void profile.refetch()}
      />
    )
  }

  if (profile.data?.data.role !== "CUSTOMER") {
    return null
  }

  return (
    <div className="space-y-3">
      {submitted ? (
        <p className="text-sm font-medium text-primary" role="status">
          Review posted. Your order history and meal reviews are up to date.
        </p>
      ) : (
        <Button
          onClick={() => setOpen((current) => !current)}
          size="sm"
          type="button"
          variant="outline"
        >
          {open ? "Close review" : "Review this meal"}
        </Button>
      )}
      {open && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review this meal</CardTitle>
            <CardDescription>
              This review will be linked to order {orderId}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewComposer
              mealId={mealId}
              onCreated={() => {
                setOpen(false)
                setSubmitted(true)
              }}
              orderId={orderId}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
