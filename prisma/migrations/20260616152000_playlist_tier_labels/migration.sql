ALTER TABLE "GameList" ADD COLUMN "tierLabels" TEXT[] NOT NULL DEFAULT ARRAY['S', 'A', 'B', 'C', 'D'];
