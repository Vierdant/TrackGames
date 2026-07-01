/*
  Warnings:

  - You are about to drop the column `commendId` on the `Like` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,listId,commentId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_commendId_fkey";

-- DropIndex
DROP INDEX "Like_listId_commendId_idx";

-- DropIndex
DROP INDEX "Like_userId_listId_commendId_key";

-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "expiresAt" SET DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days');

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "commendId",
ADD COLUMN     "commentId" TEXT;

-- CreateIndex
CREATE INDEX "Like_listId_commentId_idx" ON "Like"("listId", "commentId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_listId_commentId_key" ON "Like"("userId", "listId", "commentId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
