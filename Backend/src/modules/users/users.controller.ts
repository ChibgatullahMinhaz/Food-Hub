import { catchAsync } from "@/utils/catchAsync";
import { usersService } from "./users.service";
import { sendResponse } from "@/utils/sendResponse";
import httpStatus from 'http-status'
import type { RequestHandler } from "express";
import { Role, type UserStatus } from "@/prisma/generated/prisma/enums";
import ApiError from "@/errors/ApiError";

export const getUsers: RequestHandler = catchAsync(async (req, res,): Promise<void> => {
    const { limit, cursor, search, role, status } = req.query;

    const { users, meta } = await usersService.getAllUsers({
        limit: limit as unknown as number,
        cursor: cursor as string | undefined,
        search: search as string,
        role: role as Role | undefined,
        status: status as UserStatus | undefined,
    })

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully",
        data: users,
        meta,
    })
}
)


export const updateUser: RequestHandler = catchAsync(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const loggedInUser = req.user;

    if (!loggedInUser) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }
    if (loggedInUser.role !== Role.ADMIN && loggedInUser.id !== id) {
        throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized to update this user!");
    }


    if (loggedInUser.role !== Role.ADMIN) {
        delete payload.role;
        delete payload.status;
    }
    const user = await usersService.updateUserById(id as string, payload)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users Update successfully",
        data: user,

    })
})
export const deleteUser: RequestHandler = catchAsync(async (req, res) => {
    const { id } = req.params;
    const loggedInUser = req.user;

    if (!loggedInUser) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }
    if (loggedInUser.role !== Role.ADMIN) {
        throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized to delete this user!");
    }

    const user = await usersService.deleteUserById(id as string)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users Delete successfully",
        data: user,
    })
})

export const currentUserProfile: RequestHandler = catchAsync(async (req, res) => {
    const loggedInUser = req.user;
    if (!loggedInUser) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }
    const user = await usersService.getCurrentUserProfile(loggedInUser.id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Fetch Current Profile successfully",
        data: user,
    })
})

export const userDetails: RequestHandler = catchAsync(async (req, res) => {
    const { id: userId } = req.params;

    if (!userId || typeof userId !== 'string') {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or missing User ID");
    }
    
    const result = await usersService.getUserDetailsWithStats(userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Fetch User Details with states successfully",
        data: result,
    })
}) 