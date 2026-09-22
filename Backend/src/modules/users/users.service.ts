import { prisma } from "@/lib/prisma";
import type { IUserQueryFilters } from "./users.interface";
import { UserStatus, type Prisma } from "@/prisma/generated/prisma/client";
import ApiError from "@/errors/ApiError";
import httpStatus from 'http-status'

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

const updateUserById = async (id: string, payload: Prisma.UserUpdateInput) => {

    const isExist = await prisma.user.findUnique({ where: { id } });
    if (!isExist) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found with this ID");
    }

    const updatedUser = await prisma.user.update({
        where: { id },
        data: payload,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            updatedAt: true,
        },
    });
    if (payload.status === UserStatus.SUSPENDED || payload.status === UserStatus.BLOCKED) {
        await prisma.session.deleteMany({
            where: { userId: id },
        });
        
    }

    return updatedUser;
}

const deleteUserById = async (id: string) => {
    const isExist = await prisma.user.findUnique({ where: { id } })

    if (!isExist) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found ! I think this user already Delated ');
    }
    await prisma.user.delete({ where: { id } })
    return { message: "User Deleted Sucessfully !" }
}

const getCurrentUserProfile = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    }

    return user;
};

const getUserDetailsWithStats = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            orders: {
                take: 5,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    totalAmount: true,
                    status: true,
                    createdAt: true,
                },
            },
            _count: {
                select: {
                    orders: true,
                },
            },
        },
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    }

    return user;
};



export const usersService
    = {
    getAllUsers,
    deleteUserById,
    updateUserById,
    getCurrentUserProfile,
    getUserDetailsWithStats
}