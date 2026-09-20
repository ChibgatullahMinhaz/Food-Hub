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
        search: search as string ,
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

