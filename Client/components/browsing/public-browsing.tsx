"use client"

import { useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Clock3, Leaf, LoaderCircle, MapPin, Phone, Search, Utensils } from "lucide-react"
import { ApiErrorMessage } from "@/components/api/api-error-message"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { ReviewSection } from "@/components/reviews/review-section"
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
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useLazyGetCategoriesQuery,
} from "@/store/api/category-api"
import { useGetMealByIdQuery, useGetMealsQuery, useLazyGetMealsQuery } from "@/store/api/meal-api"
import { useGetProviderByIdQuery } from "@/store/api/provider-api"
import type { Category } from "@/types/category"
import type { MealListItem, MealListParams } from "@/types/meal"
import type { ProviderMeal } from "@/types/provider"

function priceLabel(price: number | string) {
  const value = Number(price)
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 0,
      }).format(value)
    : "Price unavailable"
}

function errorStatus(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status
  }

  return undefined
}

function LoadingGrid() {
  return (
    <div
      aria-label="Loading meals"
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          aria-hidden="true"
          className="overflow-hidden rounded-2xl border bg-card"
          key={index}
        >
          <div className="aspect-[4/3] animate-pulse bg-muted" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

function MealCard({ meal }: { meal: MealListItem | ProviderMeal }) {
  const categoryName =
    "category" in meal ? meal.category.name : undefined
  const providerPath =
    "providerId" in meal ? `/providers/${meal.providerId}` : undefined

  return (
    <Card className="group border-border/70 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link
        aria-label={`View ${meal.name}`}
        className="block"
        href={`/shop/${meal.id}`}
      >
        <div
          aria-label={meal.images[0] ? `${meal.name} dish` : `${meal.name}, no image available`}
          className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(ellipse_at_40%_35%,#fff6e8,#e6eee5)]"
          role="img"
          style={
            meal.images[0]
              ? {
                  backgroundImage: `url("${meal.images[0]}")`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }
              : undefined
          }
        >
          {!meal.images[0] && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-primary/70">
              <Utensils aria-hidden="true" className="size-8" />
              <span className="text-xs">Fresh from the kitchen</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/65 to-transparent p-4 pt-12 text-white">
            {categoryName && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
                {categoryName}
              </span>
            )}
            {"isVegetarian" in meal && meal.isVegetarian && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-green-800">
                <Leaf aria-hidden="true" className="size-3.5" />
                Vegetarian
              </span>
            )}
          </div>
        </div>
      </Link>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              className="font-semibold tracking-tight hover:text-primary"
              href={`/shop/${meal.id}`}
            >
              {meal.name}
            </Link>
            {providerPath && "provider" in meal && (
              <Link
                className="mt-1 block truncate text-xs text-muted-foreground hover:text-primary"
                href={providerPath}
              >
                {meal.provider.restaurantName}
              </Link>
            )}
          </div>
          <strong className="shrink-0 text-sm text-primary">
            {priceLabel(meal.price)}
          </strong>
        </div>
        {"description" in meal && (
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {meal.description}
          </p>
        )}
        {"preparationTime" in meal && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 aria-hidden="true" className="size-3.5" />
            {meal.preparationTime} min preparation
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MealResults({ params }: { params: MealListParams }) {
  const { data, error, isLoading, isFetching, refetch } = useGetMealsQuery(params)
  const [loadNextPage, nextPage] = useLazyGetMealsQuery()
  const [additionalMeals, setAdditionalMeals] = useState<MealListItem[]>([])
  const [nextCursor, setNextCursor] = useState<string | null | undefined>()
  const meals = [...(data?.data ?? []), ...additionalMeals]
  const cursor = nextCursor === undefined ? data?.meta?.nextCursor : nextCursor

  async function handleLoadMore() {
    if (!cursor || nextPage.isFetching) {
      return
    }

    const result = await loadNextPage({ ...params, cursor })

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

  if (isLoading) {
    return <LoadingGrid />
  }

  if (error) {
    return <ApiErrorMessage error={error} onRetry={() => void refetch()} />
  }

  if (!meals.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary">
            <Utensils aria-hidden="true" className="size-6" />
          </span>
          <h2 className="text-lg font-semibold">No meals found</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Try changing your search or filters. New favourites are always
            coming out of the kitchen.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-7">
      {nextPage.error && (
        <ApiErrorMessage
          error={nextPage.error}
          onRetry={() => void handleLoadMore()}
        />
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>
      {cursor && (
        <div className="flex justify-center">
          <Button
            disabled={nextPage.isFetching || isFetching}
            onClick={() => void handleLoadMore()}
            variant="outline"
          >
            {nextPage.isFetching ? (
              <>
                <LoaderCircle aria-hidden="true" className="animate-spin" />
                Loading more
              </>
            ) : (
              "Load more meals"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

function CategorySelect({ value }: { value: string }) {
  const { data, error } = useGetCategoriesQuery({ limit: 100 })

  return (
    <label className="grid gap-2 text-sm font-medium">
      Category
      <select
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        defaultValue={value}
        name="categoryId"
      >
        <option value="">All categories</option>
        {data?.data.data.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs font-normal text-destructive">
          Categories could not be loaded; other filters are still available.
        </span>
      )}
    </label>
  )
}

export function ShopBrowser() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryId = searchParams.get("categoryId") ?? ""
  const initialSearch = searchParams.get("search") ?? ""
  const initialMinPrice = searchParams.get("minPrice") ?? ""
  const initialMaxPrice = searchParams.get("maxPrice") ?? ""
  const initialDietaryType = searchParams.get("dietaryType") ?? ""
  const initialVegetarian = searchParams.get("isVegetarian") === "true"
  const initialSortBy = searchParams.get("sortBy") ?? "createdAt"
  const initialSortOrder = searchParams.get("sortOrder") ?? "desc"
  const [validationMessage, setValidationMessage] = useState("")

  const queryParams = useMemo<MealListParams>(() => {
    const parsedMinPrice = Number(initialMinPrice)
    const parsedMaxPrice = Number(initialMaxPrice)

    return {
      limit: 12,
      isAvailable: true,
      ...(initialSearch && { search: initialSearch }),
      ...(categoryId && { categoryId }),
      ...(initialMinPrice && Number.isFinite(parsedMinPrice) && { minPrice: parsedMinPrice }),
      ...(initialMaxPrice && Number.isFinite(parsedMaxPrice) && { maxPrice: parsedMaxPrice }),
      ...(initialDietaryType && { dietaryType: initialDietaryType }),
      ...(initialVegetarian && { isVegetarian: true }),
      sortBy:
        initialSortBy === "price" || initialSortBy === "name"
          ? initialSortBy
          : "createdAt",
      sortOrder: initialSortOrder === "asc" ? "asc" : "desc",
    }
  }, [
    categoryId,
    initialMaxPrice,
    initialMinPrice,
    initialSearch,
    initialDietaryType,
    initialSortBy,
    initialSortOrder,
    initialVegetarian,
  ])

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationMessage("")

    const formData = new FormData(event.currentTarget)
    const minPrice = String(formData.get("minPrice") ?? "")
    const maxPrice = String(formData.get("maxPrice") ?? "")
    const parsedMin = minPrice ? Number(minPrice) : undefined
    const parsedMax = maxPrice ? Number(maxPrice) : undefined

    if (
      (parsedMin !== undefined && (!Number.isFinite(parsedMin) || parsedMin < 0)) ||
      (parsedMax !== undefined && (!Number.isFinite(parsedMax) || parsedMax < 0))
    ) {
      setValidationMessage("Enter finite, non-negative prices.")
      return
    }

    if (parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax) {
      setValidationMessage("Minimum price cannot be greater than maximum price.")
      return
    }

    const nextParams = new URLSearchParams()
    const trimmedSearch = String(formData.get("search") ?? "").trim()
    const nextCategoryId = String(formData.get("categoryId") ?? "")
    const sortBy = String(formData.get("sortBy") ?? "createdAt")
    const sortOrder = String(formData.get("sortOrder") ?? "desc")

    if (trimmedSearch) nextParams.set("search", trimmedSearch)
    if (nextCategoryId) nextParams.set("categoryId", nextCategoryId)
    if (parsedMin !== undefined) nextParams.set("minPrice", String(parsedMin))
    if (parsedMax !== undefined) nextParams.set("maxPrice", String(parsedMax))
    const nextDietaryType = String(formData.get("dietaryType") ?? "").trim()
    if (nextDietaryType) nextParams.set("dietaryType", nextDietaryType)
    if (formData.get("isVegetarian") === "true") {
      nextParams.set("isVegetarian", "true")
    }
    if (sortBy !== "createdAt") nextParams.set("sortBy", sortBy)
    if (sortOrder !== "desc") nextParams.set("sortOrder", sortOrder)

    router.push(`/shop${nextParams.size ? `?${nextParams.toString()}` : ""}`)
  }

  return (
    <div className="space-y-9">
      <form
        className="grid gap-4 rounded-2xl border bg-card p-4 shadow-sm md:grid-cols-2 xl:grid-cols-6"
        key={searchParams.toString()}
        onSubmit={applyFilters}
      >
        <label className="grid gap-2 text-sm font-medium xl:col-span-2">
          Search meals
          <span className="relative">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="h-10 pl-9"
              defaultValue={initialSearch}
              name="search"
              placeholder="Search dishes or ingredients"
              type="search"
            />
          </span>
        </label>
        <CategorySelect key={categoryId} value={categoryId} />
        <label className="grid gap-2 text-sm font-medium">
          Min price
          <Input
            className="h-10"
            min="0"
            defaultValue={initialMinPrice}
            name="minPrice"
            placeholder="৳"
            type="number"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Max price
          <Input
            className="h-10"
            min="0"
            defaultValue={initialMaxPrice}
            name="maxPrice"
            placeholder="৳"
            type="number"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Dietary type
          <Input
            className="h-10"
            defaultValue={initialDietaryType}
            name="dietaryType"
            placeholder="e.g. halal"
          />
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
          <input
            className="size-4 accent-primary"
            defaultChecked={initialVegetarian}
            name="isVegetarian"
            type="checkbox"
            value="true"
          />
          Vegetarian only
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Sort by
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            defaultValue={initialSortBy}
            name="sortBy"
          >
            <option value="createdAt">Newest</option>
            <option value="price">Price</option>
            <option value="name">Name</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Sort order
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            defaultValue={initialSortOrder}
            name="sortOrder"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
        <div className="flex flex-col justify-end gap-2 md:flex-row xl:col-span-6">
          <Button className="h-10" type="submit">
            <Search aria-hidden="true" />
            Apply filters
          </Button>
          {validationMessage && (
            <p className="self-center text-sm text-destructive" role="alert">
              {validationMessage}
            </p>
          )}
        </div>
      </form>
      <MealResults key={JSON.stringify(queryParams)} params={queryParams} />
    </div>
  )
}

export function CategoryDirectory() {
  const { data, error, isLoading, refetch } = useGetCategoriesQuery({
    limit: 12,
    sortBy: "name",
    sortOrder: "asc",
  })
  const [loadNextPage, nextPage] = useLazyGetCategoriesQuery()
  const [additionalCategories, setAdditionalCategories] = useState<Category[]>([])
  const [nextCursor, setNextCursor] = useState<string | null | undefined>()
  const categories = [...(data?.data.data ?? []), ...additionalCategories]
  const cursor =
    nextCursor === undefined ? data?.data.meta.nextCursor : nextCursor

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="aspect-[16/9] animate-pulse rounded-2xl bg-muted" key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return <ApiErrorMessage error={error} onRetry={() => void refetch()} />
  }

  if (!categories.length) {
    return (
      <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
        No categories are available right now.
      </p>
    )
  }

  async function fetchNextPage() {
    if (!cursor || nextPage.isFetching) {
      return
    }

    const result = await loadNextPage({
      cursor,
      limit: 12,
      sortBy: "name",
      sortOrder: "asc",
    })

    if ("data" in result && result.data) {
      const page = result.data
      setAdditionalCategories((current) => {
        const knownIds = new Set(current.map((category) => category.id))
        return [
          ...current,
          ...page.data.data.filter(
            (category) => !knownIds.has(category.id)
          ),
        ]
      })
      setNextCursor(page.data.meta.nextCursor ?? null)
    }
  }

  return (
    <div className="space-y-7">
      {nextPage.error && (
        <ApiErrorMessage
          error={nextPage.error}
          onRetry={() => void fetchNextPage()}
        />
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard category={category} key={category.id} />
        ))}
      </div>
      {cursor && (
        <div className="flex justify-center">
          <Button
            disabled={nextPage.isFetching}
            onClick={() => void fetchNextPage()}
            variant="outline"
          >
            {nextPage.isFetching ? "Loading categories…" : "Load more categories"}
          </Button>
        </div>
      )}
    </div>
  )
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      className="group relative min-h-48 overflow-hidden rounded-2xl border bg-[radial-gradient(ellipse_at_40%_35%,#fff6e8,#e6eee5)] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      href={`/categories/${category.id}`}
    >
      {category.image ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url("${category.image}")` }}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-primary/35">
          <Utensils aria-hidden="true" className="size-12" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <h2 className="text-xl font-semibold">{category.name}</h2>
        <p className="mt-1 text-sm text-white/80">
          {category._count?.meals ?? 0} meals
        </p>
      </div>
    </Link>
  )
}

export function CategoryDetail({ id }: { id: string }) {
  const category = useGetCategoryByIdQuery(id)

  if (category.isLoading) {
    return <LoadingGrid />
  }

  if (category.error) {
    if (errorStatus(category.error) === 404) {
      return <NotFoundMessage title="Category not found" />
    }

    return (
      <ApiErrorMessage
        error={category.error}
        onRetry={() => void category.refetch()}
      />
    )
  }

  const currentCategory = category.data?.data

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          href="/categories"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All categories
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">
          {currentCategory?.name}
        </h1>
      </header>
      <MealResults
        key={id}
        params={{ limit: 12, isAvailable: true, categoryId: id }}
      />
    </div>
  )
}

export function MealDetailView({ id }: { id: string }) {
  const result = useGetMealByIdQuery(id)
  const [activeImage, setActiveImage] = useState(0)

  if (result.isLoading) {
    return (
      <div className="grid animate-pulse gap-8 lg:grid-cols-2">
        <div className="aspect-square rounded-3xl bg-muted" />
        <div className="space-y-5 py-8">
          <div className="h-8 w-2/3 rounded bg-muted" />
          <div className="h-24 rounded bg-muted" />
          <div className="h-8 w-1/3 rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (result.error) {
    if (errorStatus(result.error) === 404) {
      return <NotFoundMessage title="Meal not found" />
    }

    return (
      <ApiErrorMessage error={result.error} onRetry={() => void result.refetch()} />
    )
  }

  const meal = result.data?.data

  if (!meal) {
    return <NotFoundMessage title="Meal not found" />
  }

  const currentImage = meal.images[activeImage]

  return (
    <div className="space-y-10">
      <div className="grid items-start gap-8 lg:grid-cols-2">
      <section aria-label={`${meal.name} photos`} className="space-y-3">
        <div
          aria-label={currentImage ? `${meal.name} dish` : "No meal image available"}
          className="aspect-square overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_40%_35%,#fff6e8,#e6eee5)]"
          role="img"
          style={
            currentImage
              ? {
                  backgroundImage: `url("${currentImage}")`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }
              : undefined
          }
        >
          {!currentImage && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-primary/70">
              <Utensils aria-hidden="true" className="size-12" />
              <span>No photo available</span>
            </div>
          )}
        </div>
        {meal.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto">
            {meal.images.map((image, index) => (
              <button
                aria-label={`Show photo ${index + 1}`}
                aria-pressed={activeImage === index}
                className={`size-20 shrink-0 rounded-xl border-2 bg-cover bg-center ${activeImage === index ? "border-primary" : "border-transparent"}`}
                key={`${image}-${index}`}
                onClick={() => setActiveImage(index)}
                style={{ backgroundImage: `url("${image}")` }}
                type="button"
              />
            ))}
          </div>
        )}
      </section>
      <section className="space-y-6 py-2">
        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary hover:underline"
            href={`/categories/${meal.category.id}`}
          >
            {meal.category.name}
          </Link>
          {meal.isVegetarian && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800">
              <Leaf aria-hidden="true" className="size-3.5" />
              Vegetarian
            </span>
          )}
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {meal.name}
          </h1>
          <p className="text-2xl font-semibold text-primary">
            {priceLabel(meal.price)}
          </p>
        </div>
        <p className="whitespace-pre-line leading-7 text-muted-foreground">
          {meal.description}
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Clock3 aria-hidden="true" className="size-4" />
            {meal.preparationTime} min preparation
          </span>
          {meal.dietaryType && (
            <span className="rounded-full border px-3 py-1">{meal.dietaryType}</span>
          )}
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Prepared by</CardDescription>
            <CardTitle>
              <Link
                className="hover:text-primary hover:underline"
                href={`/providers/${meal.provider.id}`}
              >
                {meal.provider.restaurantName}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {meal.provider.address}
            </p>
            <p className="flex items-center gap-2">
              <Phone aria-hidden="true" className="size-4 shrink-0" />
              {meal.provider.phone}
            </p>
          </CardContent>
        </Card>
        <AddToCartButton isAvailable={meal.isAvailable} mealId={meal.id} />
      </section>
      </div>
      <ReviewSection id={meal.id} target="meal" />
    </div>
  )
}

export function ProviderDetailView({ id }: { id: string }) {
  const provider = useGetProviderByIdQuery(id)

  if (provider.isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
        <LoadingGrid />
      </div>
    )
  }

  if (provider.error) {
    if (errorStatus(provider.error) === 404) {
      return <NotFoundMessage title="Restaurant not found" />
    }

    return (
      <ApiErrorMessage
        error={provider.error}
        onRetry={() => void provider.refetch()}
      />
    )
  }

  const profile = provider.data?.data

  if (!profile) {
    return <NotFoundMessage title="Restaurant not found" />
  }

  return (
    <div className="space-y-9">
      <header className="relative flex min-h-64 items-end overflow-hidden rounded-3xl border bg-[radial-gradient(ellipse_at_40%_35%,#fff6e8,#e6eee5)]">
        {profile.bannerImage && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${profile.bannerImage}")` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="relative z-10 space-y-3 p-6 text-white sm:p-9">
          <div className="flex flex-wrap gap-2">
            {profile.cuisineType && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">
                {profile.cuisineType}
              </span>
            )}
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">
              {profile.isOpen ? "Open now" : "Currently closed"}
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {profile.restaurantName}
          </h1>
          {profile.description && (
            <p className="max-w-2xl text-sm leading-6 text-white/85">
              {profile.description}
            </p>
          )}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85">
            <span className="inline-flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-4" />
              {profile.address}
            </span>
            <span className="inline-flex items-center gap-2">
              <Phone aria-hidden="true" className="size-4" />
              {profile.phone}
            </span>
          </div>
        </div>
      </header>
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Fresh from this kitchen
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Available menu</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {profile._count.meals} menu items
          </p>
        </div>
        <MealResults
          key={profile.id}
          params={{
            limit: 12,
            providerId: profile.id,
            isAvailable: true,
          }}
        />
      </section>
      <ReviewSection id={profile.id} target="provider" />
    </div>
  )
}

function NotFoundMessage({ title }: { title: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-xl font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">
          This item may have been removed or the link may be incorrect.
        </p>
        <Link
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"
          href="/shop"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Browse meals
        </Link>
      </CardContent>
    </Card>
  )
}
