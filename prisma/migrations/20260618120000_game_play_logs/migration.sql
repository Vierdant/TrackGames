ALTER TABLE "User"
ADD COLUMN "libraryPrivacy" TEXT NOT NULL DEFAULT 'public',
ADD COLUMN "logsPrivacy" TEXT NOT NULL DEFAULT 'public',
ADD COLUMN "activityPrivacy" TEXT NOT NULL DEFAULT 'public';

ALTER TABLE "UserGameEntry"
ADD COLUMN "timeMode" TEXT NOT NULL DEFAULT 'manual';

ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'LOGGED_GAME_PLAY';

CREATE TABLE "UserGamePlayLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "note" TEXT NOT NULL,
    "skip" BOOLEAN NOT NULL DEFAULT false,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserGamePlayLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserGamePlayLog_userId_playedAt_idx" ON "UserGamePlayLog"("userId", "playedAt");
CREATE INDEX "UserGamePlayLog_userId_gameId_idx" ON "UserGamePlayLog"("userId", "gameId");

ALTER TABLE "UserGamePlayLog"
ADD CONSTRAINT "UserGamePlayLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserGamePlayLog"
ADD CONSTRAINT "UserGamePlayLog_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserGamePlayLog"
ADD CONSTRAINT "UserGamePlayLog_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "UserGameEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
