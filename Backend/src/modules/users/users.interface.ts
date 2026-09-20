import type { Role, UserStatus } from "@/prisma/generated/prisma/enums";
import type { BasePaginationPayload } from "@/types/based.interface";

export interface IUserQueryFilters extends BasePaginationPayload {
    role?: Role | undefined;
    status?: UserStatus | undefined;
    isEmailVerified?: boolean;
    search?: string | undefined;
}