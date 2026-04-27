import { prisma } from "../prisma";

export async function createUserIfNotExists(user: {
    id: string,
    email?: string,
}) {
    if (!user.email) return null;

    const dbUser = await prisma.user.upsert({
        where: {email: user.email},
        update: {},
        create: {
            email: user.email,
            supabaseId: user.id,
        }
    });

    return dbUser;
}