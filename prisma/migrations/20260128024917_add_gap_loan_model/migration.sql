-- CreateTable
CREATE TABLE "GapLoan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "loanAmount" REAL NOT NULL,
    "repaidAmount" REAL NOT NULL DEFAULT 0,
    "remainingAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "fullyRepaidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GapLoan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GapLoan_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GapLoan_assetId_idx" ON "GapLoan"("assetId");

-- CreateIndex
CREATE INDEX "GapLoan_status_idx" ON "GapLoan"("status");

-- CreateIndex
CREATE UNIQUE INDEX "GapLoan_userId_assetId_key" ON "GapLoan"("userId", "assetId");
