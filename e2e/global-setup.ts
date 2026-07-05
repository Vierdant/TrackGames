import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/lib/generated/prisma/client";
import { TEST_GAME, TEST_USER } from "./test-data";

export default async function globalSetup() {
	const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

	try {
		await db.user.deleteMany({ where: { email: TEST_USER.email } });
		await db.game.deleteMany({ where: { id: TEST_GAME.id } });

		await db.game.create({
			data: {
				id: TEST_GAME.id,
				slug: TEST_GAME.slug,
				name: TEST_GAME.name,
				summary: "Seeded game used by the Playwright smoke test.",
				gameStatus: "RELEASED",
				gameType: "MAINGAME",
			},
		});
	} finally {
		await db.$disconnect();
	}
}
