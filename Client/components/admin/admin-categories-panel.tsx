"use client"

import { useState } from "react"
import { LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react"
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
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useLazyGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/store/api/category-api"
import type { Category } from "@/types/category"

const acceptedImages = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
])
const maxImageSize = 5 * 1024 * 1024

function imageValidation(file: File | null) {
  if (!file) return null
  if (!acceptedImages.has(file.type)) {
    return "Use a JPEG, PNG, WEBP, AVIF or GIF image."
  }
  if (file.size > maxImageSize) return "Image must be 5 MiB or smaller."
  return null
}

function AdminCategoryList() {
  const categories = useGetCategoriesQuery({
    limit: 20,
    sortBy: "name",
    sortOrder: "asc",
  })
  const [loadNext, nextPage] = useLazyGetCategoriesQuery()
  const [additional, setAdditional] = useState<Category[]>([])
  const [nextCursor, setNextCursor] = useState<string | null | undefined>()
  const [deleteCategory, deleteResult] = useDeleteCategoryMutation()
  const allCategories = [...(categories.data?.data.data ?? []), ...additional]
  const cursor =
    nextCursor === undefined
      ? categories.data?.data.meta.nextCursor
      : nextCursor

  async function handleLoadMore() {
    if (!cursor || nextPage.isFetching) return
    const result = await loadNext({
      limit: 20,
      sortBy: "name",
      sortOrder: "asc",
      cursor,
    })
    if ("data" in result && result.data) {
      const page = result.data.data
      setAdditional((current) => {
        const known = new Set(current.map((category) => category.id))
        return [
          ...current,
          ...page.data.filter((category) => !known.has(category.id)),
        ]
      })
      setNextCursor(page.meta.nextCursor ?? null)
    }
  }

  async function handleDelete(category: Category) {
    if (category._count && category._count.meals > 0) return
    if (
      !window.confirm(
        `Delete the “${category.name}” category? This cannot be undone.`
      )
    ) {
      return
    }
    const result = await deleteCategory(category.id)
    if ("data" in result) {
      setAdditional((current) =>
        current.filter((item) => item.id !== category.id)
      )
    }
  }

  return (
    <div className="space-y-3">
      {categories.error && (
        <ApiErrorMessage
          error={categories.error}
          onRetry={() => void categories.refetch()}
        />
      )}
      {deleteResult.error && <ApiErrorMessage error={deleteResult.error} />}
      {categories.isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          Loading categories...
        </p>
      )}
      {!categories.isLoading && !categories.error && !allCategories.length && (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No categories have been created yet.
        </p>
      )}
      {allCategories.map((category) => {
        const mealsCount = category._count?.meals
        return (
          <AdminCategoryRow
            category={category}
            key={category.id}
            mealsCount={mealsCount}
            onDelete={() => void handleDelete(category)}
            deleting={deleteResult.isLoading}
          />
        )
      })}
      {cursor && (
        <div className="flex justify-center">
          <Button
            disabled={nextPage.isFetching}
            onClick={() => void handleLoadMore()}
            variant="outline"
          >
            {nextPage.isFetching ? "Loading..." : "Load more categories"}
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

function AdminCategoryRow({
  category,
  mealsCount,
  deleting,
  onDelete,
}: {
  category: Category
  mealsCount?: number
  deleting: boolean
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [message, setMessage] = useState("")
  const [updateCategory, updateResult] = useUpdateCategoryMutation()
  const changed = name.trim() !== category.name

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    const formData = new FormData()
    formData.append("name", name.trim())
    const imageInput = event.currentTarget.elements.namedItem("image")
    const file =
      imageInput instanceof HTMLInputElement ? imageInput.files?.[0] : undefined
    const validationError = imageValidation(file ?? null)
    if (validationError) {
      setMessage(validationError)
      return
    }
    if (file) formData.append("image", file)

    const result = await updateCategory({
      id: category.id,
      body: formData,
    })
    if ("data" in result) {
      setMessage("Category updated.")
      setEditing(false)
    }
  }

  return (
    <article className="rounded-xl border p-4">
      {editing ? (
        <form
          className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]"
          onSubmit={(event) => void handleSave(event)}
        >
          <label className="grid gap-2 text-sm font-medium">
            Category name
            <Input
              minLength={2}
              onChange={(event) => setName(event.currentTarget.value)}
              required
              value={name}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Replace image (optional)
            <Input
              accept=".jpg,.jpeg,.png,.webp,.avif,.gif,image/jpeg,image/png,image/webp,image/avif,image/gif"
              name="image"
              type="file"
            />
          </label>
          <Button
            className="self-end"
            disabled={updateResult.isLoading || !changed}
            type="submit"
          >
            {updateResult.isLoading ? "Saving..." : "Save"}
          </Button>
          <Button
            className="self-end"
            onClick={() => {
              setEditing(false)
              setName(category.name)
              setMessage("")
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          {(message || updateResult.error) && (
            <div className="space-y-2 sm:col-span-4">
              {message && (
                <p className="text-sm text-green-700 dark:text-green-300" role="status">
                  {message}
                </p>
              )}
              {updateResult.error && (
                <ApiErrorMessage error={updateResult.error} />
              )}
            </div>
          )}
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">{category.name}</h3>
            <p className="text-sm text-muted-foreground">
              /{category.slug} ·{" "}
              {mealsCount === undefined
                ? "Meal count unavailable"
                : `${mealsCount} ${mealsCount === 1 ? "meal" : "meals"}`}
              {category.image ? " · Image set" : " · No image"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setEditing(true)}
              size="sm"
              variant="outline"
            >
              <Pencil aria-hidden="true" />
              Edit
            </Button>
            <Button
              disabled={
                deleting || (mealsCount !== undefined && mealsCount > 0)
              }
              onClick={onDelete}
              size="sm"
              title={
                mealsCount
                  ? "Remove or reassign the meals before deleting this category."
                  : undefined
              }
              variant="destructive"
            >
              <Trash2 aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </article>
  )
}

export function AdminCategoriesPanel() {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [createCategory, createResult] = useCreateCategoryMutation()

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    const form = event.currentTarget
    const imageInput = form.elements.namedItem("image")
    const file =
      imageInput instanceof HTMLInputElement ? imageInput.files?.[0] : undefined
    const validationError = imageValidation(file ?? null)
    if (validationError) {
      setMessage(validationError)
      return
    }
    const body = new FormData()
    body.append("name", name.trim())
    if (file) body.append("image", file)

    const result = await createCategory(body)
    if ("data" in result) {
      form.reset()
      setName("")
      setMessage("Category created.")
    }
  }

  return (
    <section className="w-full space-y-4" aria-labelledby="admin-categories-title">
      <Card>
        <CardHeader>
          <CardTitle id="admin-categories-title">Category management</CardTitle>
          <CardDescription>
            Create categories, update their names or images, and remove only
            categories that have no meals assigned.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
            onSubmit={(event) => void handleCreate(event)}
          >
            <label className="grid gap-2 text-sm font-medium">
              Category name
              <Input
                minLength={2}
                onChange={(event) => setName(event.currentTarget.value)}
                required
                value={name}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Image (optional)
              <Input
                accept=".jpg,.jpeg,.png,.webp,.avif,.gif,image/jpeg,image/png,image/webp,image/avif,image/gif"
                name="image"
                type="file"
              />
            </label>
            <Button
              className="self-end"
              disabled={createResult.isLoading}
              type="submit"
            >
              {createResult.isLoading ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              ) : (
                <Plus aria-hidden="true" />
              )}
              Create category
            </Button>
            {(message || createResult.error) && (
              <div className="space-y-2 sm:col-span-3">
                {message && (
                  <p className="text-sm text-green-700 dark:text-green-300" role="status">
                    {message}
                  </p>
                )}
                {createResult.error && (
                  <ApiErrorMessage error={createResult.error} />
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
      <AdminCategoryList />
    </section>
  )
}
