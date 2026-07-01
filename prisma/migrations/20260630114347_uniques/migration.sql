/*
  Warnings:

  - A unique constraint covering the columns `[userId,listId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,commentId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Like_userId_listId_commentId_key";

-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "expiresAt" SET DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days');

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_listId_key" ON "Like"("userId", "listId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_commentId_key" ON "Like"("userId", "commentId");
