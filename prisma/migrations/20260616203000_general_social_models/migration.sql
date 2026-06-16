-- Preserve the existing list-only social records while widening the models.

ALTER TABLE "GameList" ADD COLUMN IF NOT EXISTS "image" TEXT;

ALTER TABLE "Activity" DROP CONSTRAINT IF EXISTS "Activity_listId_fkey";
ALTER TABLE "Activity" DROP CONSTRAINT IF EXISTS "Activity_commentId_fkey";
ALTER TABLE "GameListLike" DROP CONSTRAINT IF EXISTS "GameListLike_listId_fkey";
ALTER TABLE "GameListLike" DROP CONSTRAINT IF EXISTS "GameListLike_userId_fkey";
ALTER TABLE "GameListComment" DROP CONSTRAINT IF EXISTS "GameListComment_listId_fkey";
ALTER TABLE "GameListComment" DROP CONSTRAINT IF EXISTS "GameListComment_userId_fkey";

ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "targetType" TEXT;
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "targetId" TEXT;
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days');

UPDATE "Activity"
SET "targetType" = 'GAME_LIST', "targetId" = "listId"
WHERE "targetType" IS NULL AND "listId" IS NOT NULL;

UPDATE "Activity"
SET "targetType" = 'GAME', "targetId" = "gameId"::TEXT
WHERE "targetType" IS NULL AND "gameId" IS NOT NULL;

ALTER TABLE "GameListLike" RENAME TO "Like";
ALTER TABLE "GameListComment" RENAME TO "Comment";

ALTER TABLE "Like" ADD COLUMN "targetType" TEXT NOT NULL DEFAULT 'GAME_LIST';
ALTER TABLE "Like" ADD COLUMN "targetId" TEXT;
UPDATE "Like" SET "targetId" = "listId";
ALTER TABLE "Like" ALTER COLUMN "targetId" SET NOT NULL;

ALTER TABLE "Comment" ADD COLUMN "targetType" TEXT NOT NULL DEFAULT 'GAME_LIST';
ALTER TABLE "Comment" ADD COLUMN "targetId" TEXT;
ALTER TABLE "Comment" ADD COLUMN "parentId" TEXT;
UPDATE "Comment" SET "targetId" = "listId";
ALTER TABLE "Comment" ALTER COLUMN "targetId" SET NOT NULL;

ALTER TABLE "Like" DROP COLUMN "listId";
ALTER TABLE "Comment" DROP COLUMN "listId";

DROP INDEX IF EXISTS "GameListLike_userId_listId_key";
DROP INDEX IF EXISTS "GameListLike_listId_idx";
DROP INDEX IF EXISTS "GameListLike_userId_idx";
DROP INDEX IF EXISTS "GameListComment_listId_idx";
DROP INDEX IF EXISTS "GameListComment_userId_idx";

CREATE TYPE "InteractionTargetType" AS ENUM ('GAME_LIST', 'USER_PROFILE', 'GAME');
CREATE TYPE "LikeTargetType" AS ENUM ('GAME_LIST', 'COMMENT');
CREATE TYPE "NotificationType" AS ENUM ('COMMENT_REPLY', 'RECEIVED_LIKE', 'FOLLOWED_USER', 'FOLLOWING_CREATED_LIST', 'EARNED_BADGE');

ALTER TABLE "Like" ALTER COLUMN "targetType" DROP DEFAULT;
ALTER TABLE "Comment" ALTER COLUMN "targetType" DROP DEFAULT;
ALTER TABLE "Activity" ALTER COLUMN "targetType" TYPE "InteractionTargetType" USING "targetType"::"InteractionTargetType";
ALTER TABLE "Like" ALTER COLUMN "targetType" TYPE "LikeTargetType" USING "targetType"::"LikeTargetType";
ALTER TABLE "Comment" ALTER COLUMN "targetType" TYPE "InteractionTargetType" USING "targetType"::"InteractionTargetType";

ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'LIKED_GAME_LIST';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'LIKED_COMMENT';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'COMMENTED_ON_GAME_LIST';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'COMMENTED_ON_PROFILE';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'COMMENTED_ON_GAME';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'REPLIED_TO_COMMENT';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'FOLLOWED_USER';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'EARNED_BADGE';

ALTER TABLE "Activity" ADD CONSTRAINT "Activity_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Like_userId_targetType_targetId_key" ON "Like"("userId", "targetType", "targetId");
CREATE INDEX "Like_targetType_targetId_idx" ON "Like"("targetType", "targetId");
CREATE INDEX "Like_userId_idx" ON "Like"("userId");
CREATE INDEX "Comment_targetType_targetId_idx" ON "Comment"("targetType", "targetId");
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX "Activity_targetType_targetId_idx" ON "Activity"("targetType", "targetId");
CREATE INDEX "Activity_expiresAt_idx" ON "Activity"("expiresAt");

CREATE TABLE "UserFollow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFollow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" "NotificationType" NOT NULL,
    "targetType" "InteractionTargetType",
    "targetId" TEXT,
    "commentId" TEXT,
    "message" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserFollow_followerId_followingId_key" ON "UserFollow"("followerId", "followingId");
CREATE INDEX "UserFollow_followerId_idx" ON "UserFollow"("followerId");
CREATE INDEX "UserFollow_followingId_idx" ON "UserFollow"("followingId");
CREATE UNIQUE INDEX "Badge_slug_key" ON "Badge"("slug");
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");
CREATE INDEX "UserBadge_userId_idx" ON "UserBadge"("userId");
CREATE INDEX "UserBadge_badgeId_idx" ON "UserBadge"("badgeId");
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");
CREATE INDEX "Notification_actorId_idx" ON "Notification"("actorId");
CREATE INDEX "Notification_targetType_targetId_idx" ON "Notification"("targetType", "targetId");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
