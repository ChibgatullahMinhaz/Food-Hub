import { prisma } from "@/lib/prisma";
import type { IUserQueryFilters } from "./users.interface";
import type { Prisma } from "@/prisma/generated/prisma/client";

const getAllUsers = async (filters: IUserQueryFilters) => {
    const { cursor, limit, role, search, status, isEmailVerified } = filters;

    const whereConditions: Prisma.UserWhereInput = {};

    if (search) {
        whereConditions.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
        ];
    }

    if (role) whereConditions.role = role;
    if (status) whereConditions.status = status;

    if (isEmailVerified !== undefined) {
        whereConditions.emailVerified = isEmailVerified;
    }

    const users = await prisma.user.findMany({
        where: whereConditions,
        take: limit + 1,
        ...(cursor && {
            skip: 1,
            cursor: { id: cursor }
        }),
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            isEmailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            providerProfile: {
                select: {
                    id: true,
                    storeName: true,
                    isApproved: true,
                },
            },
            _count: {
                select: {
                    orders: true,
                },
            },
        },
    });

    let nextCursor: string | null = null;
    let hasMore = false;
    if (users.length > limit) {
        hasMore = true;
        const nextItem = users.pop();
        nextCursor = nextItem?.id || null;
    }

    return {
        users,
        meta: {
            limit,
            nextCursor,
            hasMore
        }
    }
}


export const usersService
    = {
    getAllUsers
}