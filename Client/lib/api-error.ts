import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import type { SerializedError } from "@reduxjs/toolkit"

type ApiFailure = FetchBaseQueryError | SerializedError

export interface ApiErrorDetails {
  title: string
  message: string
  status?: number
  fieldErrors: Array<{ path: string; message: string }>
  retryable: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getErrorSources(
  body: unknown
): Array<{ path: string; message: string }> {
  if (!isRecord(body) || !Array.isArray(body.errorSources)) {
    return []
  }

  return body.errorSources.flatMap((source) => {
    if (
      !isRecord(source) ||
      (typeof source.path !== "string" && typeof source.path !== "number") ||
      typeof source.message !== "string"
    ) {
      return []
    }

    return [{ path: String(source.path), message: source.message }]
  })
}

function getBackendMessage(body: unknown): string | undefined {
  if (isRecord(body) && typeof body.message === "string") {
    return body.message
  }

  return undefined
}

export function getApiErrorDetails(
  error: ApiFailure | undefined
): ApiErrorDetails | null {
  if (!error) {
    return null
  }

  if ("status" in error) {
    if (typeof error.status === "number") {
      const title =
        error.status === 401
          ? "Sign-in required"
          : error.status === 403
            ? "Access denied"
            : "Request failed"
      const message =
        getBackendMessage(error.data) ??
        (error.status === 401
          ? "Sign in to access this information."
          : error.status === 403
            ? "Your account does not have permission to access this information."
            : `The server returned an error (${error.status}).`)

      return {
        title,
        message,
        status: error.status,
        fieldErrors:
          error.status === 400 && getBackendMessage(error.data) === "Validation Error"
            ? getErrorSources(error.data)
            : [],
        retryable: error.status >= 500,
      }
    }

    const title =
      error.status === "TIMEOUT_ERROR"
        ? "Request timed out"
        : error.status === "PARSING_ERROR"
          ? "Unexpected server response"
          : error.status === "CUSTOM_ERROR"
            ? "Request failed"
            : "Could not reach the server"

    return {
      title,
      message:
        error.status === "PARSING_ERROR"
          ? "The server response could not be read."
          : error.status === "CUSTOM_ERROR"
            ? error.error
            : error.error,
      fieldErrors: [],
      retryable: true,
    }
  }

  return {
    title: "Request failed",
    message: error.message ?? "The request could not be completed.",
    fieldErrors: [],
    retryable: false,
  }
}
