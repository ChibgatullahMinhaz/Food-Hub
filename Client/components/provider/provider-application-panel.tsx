"use client"

import { useEffect } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, LoaderCircle } from "lucide-react"
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
import { useGetCurrentProfileQuery } from "@/store/api/profile-api"
import {
  useApplyForProviderMutation,
  useGetMyProviderProfileQuery,
} from "@/store/api/provider-api"

export function ProviderApplicationPanel() {
  const router = useRouter()
  const {
    data: providerResponse,
    error: providerError,
    isLoading,
    isFetching,
    refetch,
  } = useGetMyProviderProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const provider = providerResponse?.data ?? null
  const isApproved = provider?.status === "APPROVED"
  const currentProfile = useGetCurrentProfileQuery(undefined, {
    skip: !isApproved,
    refetchOnMountOrArgChange: true,
  })
  const [applyForProvider, application] = useApplyForProviderMutation()

  useEffect(() => {
    if (currentProfile.data?.data.role === "PROVIDER") {
      router.replace("/seller")
    }
  }, [currentProfile.data, router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const values = new FormData(form)
    const image = values.get("image")
    const payload = {
      restaurantName: String(values.get("restaurantName") ?? "").trim(),
      address: String(values.get("address") ?? "").trim(),
      phone: String(values.get("phone") ?? "").trim(),
      description: String(values.get("description") ?? "").trim(),
      cuisineType: String(values.get("cuisineType") ?? "").trim(),
    }

    const body =
      image instanceof File && image.size > 0
        ? (() => {
            const formData = new FormData()
            Object.entries(payload).forEach(([key, value]) => {
              if (value) formData.append(key, value)
            })
            formData.append("image", image)
            return formData
          })()
        : payload

    const result = await applyForProvider(body)

    if ("data" in result) {
      form.reset()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        Checking provider application...
      </div>
    )
  }

  if (providerError) {
    return (
      <ApiErrorMessage error={providerError} onRetry={() => void refetch()} />
    )
  }

  if (isApproved) {
    return (
      <div className="rounded-xl border border-green-600/25 bg-green-600/5 p-4">
        <p className="flex items-center gap-2 font-medium text-green-800 dark:text-green-300">
          <CheckCircle2 aria-hidden="true" className="size-5" />
          Your provider application is approved.
        </p>
        {currentProfile.error && (
          <ApiErrorMessage
            error={currentProfile.error}
            onRetry={() => void currentProfile.refetch()}
          />
        )}
        {currentProfile.isFetching && (
          <p className="mt-2 text-sm text-muted-foreground">
            Refreshing your account access...
          </p>
        )}
      </div>
    )
  }

  if (provider?.status === "PENDING") {
    return (
      <div className="rounded-xl border border-amber-600/25 bg-amber-600/5 p-4">
        <p className="font-medium">Application under review</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {provider.restaurantName} is waiting for admin approval. This page
          can check again for an updated decision.
        </p>
        <Button
          className="mt-3"
          disabled={isFetching}
          onClick={() => void refetch()}
          size="sm"
          variant="outline"
        >
          {isFetching ? "Checking..." : "Check application status"}
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Apply to become a food provider</CardTitle>
        <CardDescription>
          Share your restaurant details. Provider access starts after an admin
          approves your application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {provider?.status === "REJECTED" && (
          <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            Your previous application was rejected. You can update your details
            and submit it again for review.
          </p>
        )}
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium sm:col-span-2">
            Restaurant name
            <Input
              autoComplete="organization"
              minLength={3}
              name="restaurantName"
              required
              defaultValue={provider?.restaurantName ?? ""}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium sm:col-span-2">
            Address
            <Input
              autoComplete="street-address"
              minLength={5}
              name="address"
              required
              defaultValue={provider?.address ?? ""}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Phone
            <Input
              autoComplete="tel"
              minLength={10}
              name="phone"
              required
              defaultValue={provider?.phone ?? ""}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Cuisine type
            <Input
              name="cuisineType"
              placeholder="e.g. Bangladeshi"
              defaultValue={provider?.cuisineType ?? ""}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium sm:col-span-2">
            Description
            <Textarea
              name="description"
              rows={3}
              defaultValue={provider?.description ?? ""}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium sm:col-span-2">
            Restaurant banner (optional)
            <Input
              accept=".jpg,.jpeg,.png,.webp,.avif,.gif,image/jpeg,image/png,image/webp,image/avif,image/gif"
              name="image"
              type="file"
            />
            <span className="font-normal text-muted-foreground">
              JPEG, PNG, WEBP, AVIF or GIF; maximum 5 MiB.
            </span>
          </label>
          {application.error && (
            <div className="sm:col-span-2">
              <ApiErrorMessage error={application.error} />
            </div>
          )}
          <div className="sm:col-span-2">
            <Button disabled={application.isLoading} type="submit">
              {application.isLoading ? (
                <>
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                  Submitting...
                </>
              ) : provider?.status === "REJECTED" ? (
                "Resubmit application"
              ) : (
                "Submit application"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
