import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { Role } from "@/prisma/generated/prisma/enums.js";
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        requireEmailVerification: false
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: Role.CUSTOMER,
                input: false,
            },
        },
    },

    advanced: {
        useSecureCookies: process.env.NODE_ENV === "production",
        // crossSubDomainCookies: { enabled: true }, 
    },

});