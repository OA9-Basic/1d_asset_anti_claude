-- AlterTable
ALTER TABLE "Asset" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "deletedAt" DATETIME;

-- CreateIndex
CREATE INDEX "Asset_deletedAt_idx" ON "Asset"("deletedAt");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
