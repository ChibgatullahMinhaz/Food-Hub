"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import {
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useGetCategoriesQuery } from "@/store/api/category-api"
import {
  useCreateMealMutation,
  useDeleteMealMutation,
  useGetMealsQuery,
  useLazyGetMealsQuery,
  useUpdateMealMutation,
} from "@/store/api/meal-api"
import { useGetMyProviderProfileQuery } from "@/store/api/provider-api"
import type { MealListItem } from "@/types/meal"

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
])
const maxImageSize = 5 * 1024 * 1024
const maxImages = 5

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

function validateImages(files: FileList | null, requireImage: boolean) {
  const selected = Array.from(files ?? [])

  if (requireImage && !selected.length) {
    return "Add at least one meal photo."
  }
  if (selected.length > maxImages) {
    return `Choose no more than ${maxImages} images.`
  }
  if (selected.some((file) => !allowedImageTypes.has(file.type))) {
    return "Only JPEG, PNG, WEBP, AVIF or GIF images are accepted."
  }
  if (selected.some((file) => file.size > maxImageSize)) {
    return "Each image must be 5 MiB or smaller."
  }
  return null
}

function ProviderMenuEditor({ providerId }: { providerId: string }) {
  const categories = useGetCategoriesQuery({ limit: 100 })
  const meals = useGetMealsQuery(
    { providerId, limit: 100 },
    { skip: !providerId }
  )
  const [loadNextPage, nextPage] = useLazyGetMealsQuery()
  const [createMeal, createState] = useCreateMealMutation()
  const [updateMeal, updateState] = useUpdateMealMutation()
  const [deleteMeal, deleteState] = useDeleteMealMutation()
  const [editingMeal, setEditingMeal] = useState<MealListItem | null>(null)
  const [additionalMeals, setAdditionalMeals] = useState<MealListItem[]>([])
  const [nextCursor, setNextCursor] = useState<string | null | undefined>()
  const [formMessage, setFormMessage] = useState("")
  const allMeals = [...(meals.data?.data ?? []), ...additionalMeals]
  const cursor =
    nextCursor === undefined ? meals.data?.meta?.nextCursor : nextCursor
  const busy = createState.isLoading || updateState.isLoading

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormMessage("")

    const form = event.currentTarget
    const values = new FormData(form)
    const imageInput = form.elements.namedItem("images")
    const files =
      imageInput instanceof HTMLInputElement ? imageInput.files : null
    const imageError = validateImages(files, !editingMeal)

    if (imageError) {
      setFormMessage(imageError)
      return
    }

    values.delete("images")
    Array.from(files ?? []).forEach((file) => values.append("images", file))

    const result = editingMeal
      ? await updateMeal({ id: editingMeal.id, body: values })
      : await createMeal(values)

    if ("data" in result) {
      form.reset()
      setEditingMeal(null)
      setFormMessage(
        editingMeal ? "Meal updated successfully." : "Meal added to your menu."
      )
    }
  }

  async function handleLoadMore() {
    if (!cursor || nextPage.isFetching) return

    const result = await loadNextPage({ providerId, limit: 100, cursor })

    if ("data" in result && result.data) {
      const page = result.data
      setAdditionalMeals((current) => {
        const knownIds = new Set(current.map((meal) => meal.id))
        return [
          ...current,
          ...page.data.filter((meal) => !knownIds.has(meal.id)),
        ]
      })
      setNextCursor(page.meta?.nextCursor ?? null)
    }
  }

  async function handleDelete(meal: MealListItem) {
    if (
      !window.confirm(
        `Delete “${meal.name}”? If it has order history, the server may reject deletion.`
      )
    ) {
      return
    }

    const result = await deleteMeal(meal.id)
    if ("data" in result) {
      setAdditionalMeals((current) =>
        current.filter((existing) => existing.id !== meal.id)
      )
    }

  }

  return (
    <section className="w-full space-y-6" aria-labelledby="menu-heading">
      <Card>
        <CardHeader>
          <CardTitle id="menu-heading">Manage your menu</CardTitle>
          <CardDescription>
            Add dishes with photos, update availability and details, or remove
            items that are no longer offered.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSave}>
            <label className="grid gap-2 text-sm font-medium">
              Meal name
              <Input
                key={`meal-name-${editingMeal?.id ?? "new"}`}
                defaultValue={editingMeal?.name ?? ""}
                minLength={2}
                name="name"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Category
              <select
                key={`meal-category-${editingMeal?.id ?? "new"}`}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue={editingMeal?.categoryId ?? ""}
                name="categoryId"
                required
              >
                <option value="" disabled>
                  Choose a category
                </option>
                {categories.data?.data.data.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Price (BDT)
              <Input
                key={`meal-price-${editingMeal?.id ?? "new"}`}
                defaultValue={editingMeal ? String(editingMeal.price) : ""}
                min="0.01"
                name="price"
                required
                step="0.01"
                type="number"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Preparation time (minutes)
              <Input
                key={`meal-time-${editingMeal?.id ?? "new"}`}
                defaultValue={
                  editingMeal ? String(editingMeal.preparationTime) : ""
                }
                min="1"
                name="preparationTime"
                required
                step="1"
                type="number"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium sm:col-span-2">
              Description
              <Textarea
                key={`meal-description-${editingMeal?.id ?? "new"}`}
                defaultValue={editingMeal?.description ?? ""}
                minLength={10}
                name="description"
                required
                rows={3}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Availability
              <select
                key={`meal-availability-${editingMeal?.id ?? "new"}`}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                defaultValue={String(editingMeal?.isAvailable ?? true)}
                name="isAvailable"
              >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Vegetarian
              <select
                key={`meal-vegetarian-${editingMeal?.id ?? "new"}`}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                defaultValue={String(editingMeal?.isVegetarian ?? false)}
                name="isVegetarian"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Dietary type (optional)
              <Input
                key={`meal-diet-${editingMeal?.id ?? "new"}`}
                defaultValue={editingMeal?.dietaryType ?? ""}
                name="dietaryType"
                placeholder="e.g. Halal, gluten-free"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Meal photos {editingMeal ? "(optional)" : "(1–5 required)"}
              <Input
                accept=".jpg,.jpeg,.png,.webp,.avif,.gif,image/jpeg,image/png,image/webp,image/avif,image/gif"
                key={`meal-images-${editingMeal?.id ?? "new"}`}
                multiple
                name="images"
                required={!editingMeal}
                type="file"
              />
              <span className="font-normal text-muted-foreground">
                Each image must be 5 MiB or smaller.
                {editingMeal
                  ? " Adding photos replaces the current photo set."
                  : ""}
              </span>
            </label>
            {(formMessage || createState.error || updateState.error) && (
              <div className="space-y-2 sm:col-span-2">
                {formMessage && (
                  <p
                    className={
                      formMessage.includes("successfully") ||
                      formMessage.includes("added")
                        ? "text-sm text-green-700 dark:text-green-300"
                        : "text-sm text-destructive"
                    }
                    role="status"
                  >
                    {formMessage}
                  </p>
                )}
                {createState.error && (
                  <ApiErrorMessage error={createState.error} />
                )}
                {updateState.error && (
                  <ApiErrorMessage error={updateState.error} />
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button disabled={busy || categories.isLoading} type="submit">
                {busy ? (
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                ) : editingMeal ? (
                  "Save changes"
                ) : (
                  <>
                    <Plus aria-hidden="true" />
                    Add meal
                  </>
                )}
              </Button>
              {editingMeal && (
                <Button
                  onClick={() => {
                    setEditingMeal(null)
                    setFormMessage("")
                  }}
                  type="button"
                  variant="outline"
                >
                  Cancel edit
                </Button>
              )}
            </div>
          </form>
          {categories.error && (
            <div className="mt-4">
              <ApiErrorMessage
                error={categories.error}
                onRetry={() => void categories.refetch()}
              />
            </div>
          )}
          {categories.data?.data.data.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              No categories are available yet, so a meal cannot be created.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Your dishes</h2>
            <p className="text-sm text-muted-foreground">
              Unavailable dishes are included so you can make them available
              again.
            </p>
          </div>
          <Button
            disabled={meals.isFetching}
            onClick={() => void meals.refetch()}
            size="sm"
            variant="outline"
          >
            <RefreshCw
              aria-hidden="true"
              className={meals.isFetching ? "animate-spin" : ""}
            />
            Refresh
          </Button>
        </div>

        {meals.error && (
          <ApiErrorMessage error={meals.error} onRetry={() => void meals.refetch()} />
        )}
        {deleteState.error && <ApiErrorMessage error={deleteState.error} />}
        {meals.isLoading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Loading your menu...
          </p>
        )}
        {!meals.isLoading && !meals.error && !allMeals.length && (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Your menu is empty. Add your first dish above.
          </p>
        )}
        <div className="grid gap-3">
          {allMeals.map((meal) => (
            <Card key={meal.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{meal.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        meal.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {meal.isAvailable ? "Available" : "Unavailable"}
                    </span>
                    {meal.isVegetarian && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                        Vegetarian
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {meal.category.name} · {priceLabel(meal.price)} ·{" "}
                    {meal.preparationTime} min
                  </p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {meal.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setEditingMeal(meal)
                      setFormMessage("")
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <Pencil aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    disabled={deleteState.isLoading}
                    onClick={() => void handleDelete(meal)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {cursor && (
          <div className="flex justify-center">
            <Button
              disabled={nextPage.isFetching}
              onClick={() => void handleLoadMore()}
              variant="outline"
            >
              {nextPage.isFetching ? "Loading..." : "Load more"}
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
    </section>
  )
}

export function ProviderMenuManager() {
  const profile = useGetMyProviderProfileQuery()

  if (profile.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        Loading your provider profile...
      </p>
    )
  }

  if (profile.error) {
    return (
      <ApiErrorMessage
        error={profile.error}
        onRetry={() => void profile.refetch()}
      />
    )
  }

  const provider = profile.data?.data

  if (!provider) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        No provider profile is linked to this account. Contact FoodHub support
        before managing a menu.
      </p>
    )
  }

  if (provider.status !== "APPROVED") {
    return (
      <p className="rounded-xl border border-amber-600/25 bg-amber-600/5 p-4 text-sm">
        Menu management is available after your provider application is
        approved.
      </p>
    )
  }

  return <ProviderMenuEditor providerId={provider.id} />
}
