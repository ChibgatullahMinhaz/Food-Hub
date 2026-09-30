import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { env } from "@/config/env";
import { Role } from "@/prisma/generated/prisma/enums";

export async function seedAdmin() {
    try {
        const adminEmail = env.ADMIN.EMAIL;
        const adminPassword = env.ADMIN.PASSWORD;
        const adminName = env.ADMIN.NAME;

        if (!adminEmail || !adminPassword) {
            console.error("Admin credentials are missing in environment variables!");
            process.exit(1);
        }

        const existingAdmin = await prisma.user.findUnique({
            where: {
                email: adminEmail,
            },
        });

        if (existingAdmin) {
            console.log("Admin user already exists. Skipping seed.");
            return;
        }

        const res = await auth.api.signUpEmail({
            body: {
                email: adminEmail,
                password: adminPassword,
                name: adminName,
            },
        });

        if (res?.user) {
            await prisma.user.update({
                where: {
                    id: res.user.id,
                },
                data: {
                    role: Role.ADMIN,
                },
            });
        }

        console.log("Admin user seeded successfully!");
    } catch (error) {
        console.error("Error seeding admin user:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

