import type { Role } from "@/prisma/generated/prisma/enums";
import { Session, User } from "better-auth";

declare global {
  namespace Express {
    interface Request {
      user?: User & {role : Role};
      session?: Session;
    }
  }
}

export {};