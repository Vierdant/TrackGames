-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('CONSIDERING', 'PLANNED', 'IN_PROGRESS', 'SHIPPED');

-- CreateTable
CREATE TABLE "Changelog" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT,
    "summary" TEXT,
    "content" JSONB NOT NULL DEFAULT '[]',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Changelog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapItem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB NOT NULL DEFAULT '[]',
    "status" "RoadmapStatus" NOT NULL DEFAULT 'PLANNED',
    "position" INTEGER NOT NULL DEFAULT 0,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoadmapVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Changelog_slug_key" ON "Changelog"("slug");

-- CreateIndex
CREATE INDEX "Changelog_publishedAt_idx" ON "Changelog"("publishedAt");

-- CreateIndex
CREATE INDEX "Changelog_published_publishedAt_idx" ON "Changelog"("published", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapItem_slug_key" ON "RoadmapItem"("slug");

-- CreateIndex
CREATE INDEX "RoadmapItem_status_idx" ON "RoadmapItem"("status");

-- CreateIndex
CREATE INDEX "RoadmapItem_public_position_idx" ON "RoadmapItem"("public", "position");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapVote_userId_itemId_key" ON "RoadmapVote"("userId", "itemId");

-- CreateIndex
CREATE INDEX "RoadmapVote_itemId_idx" ON "RoadmapVote"("itemId");

-- CreateIndex
CREATE INDEX "RoadmapVote_userId_idx" ON "RoadmapVote"("userId");

-- AddForeignKey
ALTER TABLE "RoadmapVote" ADD CONSTRAINT "RoadmapVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapVote" ADD CONSTRAINT "RoadmapVote_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RoadmapItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
