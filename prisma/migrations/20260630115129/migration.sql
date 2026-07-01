/*
  Warnings:

  - A unique constraint covering the columns `[userId,listId,commentId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "expiresAt" SET DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days');

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_listId_commentId_key" ON "Like"("userId", "listId", "commentId");
