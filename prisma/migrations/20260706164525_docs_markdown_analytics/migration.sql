-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "expiresAt" SET DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days');

-- Content switches from block-JSON to Markdown text. Existing entries are reset
-- (per decision) rather than converted.
ALTER TABLE "Changelog" DROP COLUMN "content";
ALTER TABLE "Changelog" ADD COLUMN "content" TEXT NOT NULL DEFAULT '';

ALTER TABLE "RoadmapItem" DROP COLUMN "content";
ALTER TABLE "RoadmapItem" ADD COLUMN "content" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Analytics" (
    "key" TEXT NOT NULL,
    "value" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("key")
);
