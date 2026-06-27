import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const IMPORT_TABLES = [
    "MultiplayerMode",
    "Game",
    "Collection",
    "Franchise",
    "Genre",
    "Platform",
    "Company",
    "Keyword",
    "Theme",
];

async function main() {
    if (!process.argv.includes("--yes")) {
        console.log("This deletes data from tables imported by scripts/import-api.ts.");
        console.log("Run again with --yes to confirm.");
        process.exit(1);
    }

    const { default: db } = await import("@/lib/db");
    const tables = IMPORT_TABLES.map((table) => `"${table}"`).join(", ");

    await db.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
    await db.$disconnect();

    console.log(`Cleared import data from: ${IMPORT_TABLES.join(", ")}`);
}

main().catch((err) => {
    console.error("Error clearing import data:", err);
    process.exit(1);
});
