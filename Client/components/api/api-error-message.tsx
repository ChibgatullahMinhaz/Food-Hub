"use client"

import { Button } from "@/components/ui/button"
import { getApiErrorDetails } from "@/lib/api-error"
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import type { SerializedError } from "@reduxjs/toolkit"

type ApiErrorMessageProps = {
  error: FetchBaseQueryError | SerializedError | undefined
  onRetry?: () => void
}

export function ApiErrorMessage({ error, onRetry }: ApiErrorMessageProps) {
  const details = getApiErrorDetails(error)

  if (!details) {
    return null
  }

  return (
    <div
      role="alert"
      className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="font-semibold text-destructive">{details.title}</p>
          <p className="text-foreground">{details.message}</p>
          {details.status !== undefined && (
            <p className="text-xs text-muted-foreground">
              HTTP {details.status}
            </p>
          )}
        </div>
        {onRetry && details.retryable && (
          <Button onClick={onRetry} size="sm" variant="outline">
            Try again
          </Button>
        )}
      </div>
      {details.fieldErrors.length > 0 && (
        <ul className="mt-3 list-inside list-disc space-y-1 text-muted-foreground">
          {details.fieldErrors.map(({ path, message }, index) => (
            <li key={`${path}-${index}`}>
              {path}: {message}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
