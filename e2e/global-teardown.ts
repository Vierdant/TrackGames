import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/lib/generated/prisma/client";
import { TEST_GAME, TEST_USER } from "./test-data";

export default async function globalTeardown() {
	const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

	try {
		await db.user.deleteMany({ where: { email: TEST_USER.email } });
		await db.game.deleteMany({ where: { id: TEST_GAME.id } });
	} finally {
		await db.$disconnect();
	}
}
