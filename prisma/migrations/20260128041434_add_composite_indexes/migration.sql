-- CreateIndex
CREATE INDEX "Asset_status_featured_idx" ON "Asset"("status", "featured");

-- CreateIndex
CREATE INDEX "Asset_status_type_idx" ON "Asset"("status", "type");

-- CreateIndex
CREATE INDEX "Contribution_assetId_status_idx" ON "Contribution"("assetId", "status");

-- CreateIndex
CREATE INDEX "Contribution_userId_status_idx" ON "Contribution"("userId", "status");

-- CreateIndex
CREATE INDEX "Transaction_walletId_type_status_idx" ON "Transaction"("walletId", "type", "status");

-- CreateIndex
CREATE INDEX "Transaction_userId_type_idx" ON "Transaction"("userId", "type");
