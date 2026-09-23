import ApiError from "@/errors/ApiError";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { ProviderStatus, Role } from "@/prisma/generated/prisma/enums";
import httpStatus from "http-status";
import type { GetProviderQueryInput } from "./provider.validation";

export const applyForProvider = async (
    userId: string,
    payload: Omit<Prisma.ProviderProfileUncheckedCreateInput, "userId" | "id" | "status">) => {
    const existingProfile = await prisma.providerProfile.findUnique({
        where: { userId },
    });

    if (existingProfile) {
        if (existingProfile.status === ProviderStatus.APPROVED) {
            throw new ApiError(httpStatus.BAD_REQUEST, "You are already an approved provider.");
        }
        if (existingProfile.status === ProviderStatus.PENDING) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Your provider application is already pending approval.");
        }
    }

    return await prisma.providerProfile.create({
        data: {
            ...payload,
            userId,
            status: ProviderStatus.PENDING,
        },
        select: {
            id: true,
            userId: true,
            restaurantName: true,
            description: true,
            bannerImage: true,
            cuisineType: true,
            address: true,
            phone: true,
            isOpen: true,
            status: true,
            createdAt: true,
        },
    });
};

export const updateProviderStatus = async (
    providerProfileId: string,
    status: ProviderStatus
) => {
    const profile = await prisma.providerProfile.findUnique({
        where: { id: providerProfileId },
    });

    if (!profile) {
        throw new ApiError(httpStatus.NOT_FOUND, "Provider profile application not found.");
    }

    return await prisma.$transaction(async (tx) => {
        const updatedProfile = await tx.providerProfile.update({
            where: { id: providerProfileId },
            data: { status },
        });

        if (status === ProviderStatus.APPROVED) {
            await tx.user.update({
                where: { id: profile.userId },
                data: { role: Role.PROVIDER },
            });
        }

        return updatedProfile;
    });
};

export const getAllProviders = async (query: GetProviderQueryInput) => {
    const { limit, sortOrder = "desc", cursor, search, status } = query;
    const whereConditions: Prisma.ProviderProfileWhereInput = {
        ...(status && { status }),
        ...(search && {
            OR: [
                { restaurantName: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
                { address: { contains: search, mode: "insensitive" } },
            ],

        }),
    };

    const providers = await prisma.providerProfile.findMany({
        where: whereConditions,
        take: limit + 1,
        ...(cursor && {cursor: {id:cursor}}),
        skip: cursor ? 1 : 0,
        orderBy: {
            createdAt: sortOrder,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });

    let nextCursor: string | null = null;
    let hasMore = false;

    if (providers.length > limit) {
        hasMore = true;
        const nextItem = providers.pop();
        nextCursor = nextItem?.id || null;
    }



    return {
        meta: {

            limit,
            nextCursor,
            hasMore
        },
        data: providers,
    };
} 
