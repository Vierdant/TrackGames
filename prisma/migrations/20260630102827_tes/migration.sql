/*
  Warnings:

  - You are about to drop the column `targetId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `Like` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,listId,commendId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `commendId` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listId` to the `Like` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Like_targetType_targetId_idx";

-- DropIndex
DROP INDEX "Like_userId_targetType_targetId_key";

-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "expiresAt" SET DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days');

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "targetId",
DROP COLUMN "targetType",
ADD COLUMN     "commendId" TEXT NOT NULL,
ADD COLUMN     "listId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Like_listId_commendId_idx" ON "Like"("listId", "commendId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_listId_commendId_key" ON "Like"("userId", "listId", "commendId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_listId_fkey" FOREIGN KEY ("listId") REFERENCES "GameList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_commendId_fkey" FOREIGN KEY ("commendId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
