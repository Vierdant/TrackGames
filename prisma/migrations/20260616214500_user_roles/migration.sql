CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF', 'VIP');

ALTER TABLE "User" ADD COLUMN "roles" "UserRole"[] NOT NULL DEFAULT ARRAY[]::"UserRole"[];
