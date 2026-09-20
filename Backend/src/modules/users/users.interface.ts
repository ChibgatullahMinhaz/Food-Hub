import type { BasePaginationPayload } from "@/types";

export interface GetAllUserPayload extends BasePaginationPayload {
    search?: string;
    role?: string;
} 