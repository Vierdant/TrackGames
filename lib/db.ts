import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const prismaClientSingleton = () => {
    return new PrismaClient({
        adapter: new PrismaPg({
            connectionString: process.env.DATABASE_URL,
        }),
    });
};

declare global {
    // attach a prisma client singleton to the global scope for dev hot-reload
    // apps. Use a different name than `globalThis` to avoid redeclaration.
    var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

const db = globalThis.prismaGlobal ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = db;