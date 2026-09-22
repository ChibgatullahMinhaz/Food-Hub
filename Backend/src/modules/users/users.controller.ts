import { catchAsync } from "@/utils/catchAsync";
import { usersService } from "./users.service";
import { sendResponse } from "@/utils/sendResponse";
import httpStatus from 'http-status'
import type { RequestHandler } from "express";
import type { Role, UserStatus } from "@/prisma/generated/prisma/enums";

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

    const user = await usersService.deleteUserById(id as string)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users Update successfully",
        data: user,

    })
})