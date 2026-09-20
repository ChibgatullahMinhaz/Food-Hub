import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { catchAsync } from "@/utils/catchAsync";

export const validateRequest = (
    schema: ZodTypeAny
): RequestHandler =>
    catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const parsed = (await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
            cookies: req.cookies,
            file: req.file,
            files: req.files,
        })) as {
            body?: Record<string, any>;
            query?: Record<string, any>;
            params?: Record<string, any>;
            cookies?: Record<string, any>;
            file?: Record<string, any>;
            files?: Record<string, any>;
        };

        if (parsed.body) req.body = parsed.body;
        if (parsed.query) req.query = parsed.query;
        if (parsed.params) req.params = parsed.params;
        if (parsed.cookies) req.cookies = parsed.cookies;

        next();
    });