-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "username" TEXT,
    "passwordHash" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "withdrawableBalance" REAL NOT NULL DEFAULT 0,
    "storeCredit" REAL NOT NULL DEFAULT 0,
    "totalDeposited" REAL NOT NULL DEFAULT 0,
    "totalWithdrawn" REAL NOT NULL DEFAULT 0,
    "totalConvertedToCredit" REAL NOT NULL DEFAULT 0,
    "totalContributed" REAL NOT NULL DEFAULT 0,
    "totalProfitReceived" REAL NOT NULL DEFAULT 0,
    "lockedBalance" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "balanceBefore" REAL NOT NULL,
    "balanceAfter" REAL NOT NULL,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "txHash" TEXT,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "verifiedFrom" TEXT,
    "blockNumber" BIGINT,
    "blockTimestamp" DATETIME,
    "network" TEXT,
    "depositOrderId" TEXT,
    CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_depositOrderId_fkey" FOREIGN KEY ("depositOrderId") REFERENCES "DepositOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "deliveryType" TEXT NOT NULL DEFAULT 'DOWNLOAD',
    "targetPrice" REAL NOT NULL,
    "platformFee" REAL NOT NULL DEFAULT 0.15,
    "platformFeeAfterExcess" REAL NOT NULL DEFAULT 0.15,
    "currentCollected" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "totalPurchases" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" REAL NOT NULL DEFAULT 0,
    "totalProfitDistributed" REAL NOT NULL DEFAULT 0,
    "deliveryUrl" TEXT,
    "deliveryKey" TEXT,
    "streamUrl" TEXT,
    "externalAccessUrl" TEXT,
    "externalCredentials" JSONB,
    "thumbnail" TEXT,
    "sourceUrl" TEXT,
    "metadata" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "profitDistributionTiming" TEXT NOT NULL DEFAULT 'IMMEDIATE',
    "customDistributionInterval" INTEGER,
    "lastDistributionAt" DATETIME,
    "approvedAt" DATETIME,
    "purchasedAt" DATETIME,
    "availableAt" DATETIME,
    "votingStartsAt" DATETIME,
    "votingEndsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AssetRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "assetId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "deliveryType" TEXT NOT NULL DEFAULT 'DOWNLOAD',
    "estimatedPrice" REAL NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "thumbnail" TEXT,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "rejectionReason" TEXT,
    "votedAt" DATETIME,
    "approvedAt" DATETIME,
    "rejectedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssetRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssetRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "assetRequestId" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_assetRequestId_fkey" FOREIGN KEY ("assetRequestId") REFERENCES "AssetRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "excessAmount" REAL NOT NULL DEFAULT 0,
    "profitShareRatio" REAL NOT NULL DEFAULT 0,
    "totalProfitReceived" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isInvestment" BOOLEAN NOT NULL DEFAULT false,
    "refundedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Contribution_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProfitShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contributionId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "shareRatio" REAL NOT NULL,
    "dailyRevenue" REAL NOT NULL,
    "distributedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfitShare_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "Contribution" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProfitShare_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProfitShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssetPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "purchaseAmount" REAL NOT NULL DEFAULT 1,
    "deliveryAccessKey" TEXT,
    "deliveryExpiry" DATETIME,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssetPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssetPurchase_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "cryptoCurrency" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "rejectionReason" TEXT,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WithdrawalRequest_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WithdrawalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProfitDistribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "totalRevenue" REAL NOT NULL,
    "platformProfit" REAL NOT NULL,
    "contributorProfit" REAL NOT NULL,
    "distributedShares" INTEGER NOT NULL DEFAULT 0,
    "distributionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfitDistribution_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DepositOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "usdAmount" REAL NOT NULL,
    "cryptoAmount" REAL NOT NULL,
    "cryptoCurrency" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "priceAtCreation" REAL NOT NULL,
    "priceExpiresAt" DATETIME NOT NULL,
    "depositAddress" TEXT NOT NULL,
    "derivationPath" TEXT NOT NULL,
    "privateKeyEncrypted" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "expiresAt" DATETIME NOT NULL,
    "txHash" TEXT,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "requiredConfirmations" INTEGER NOT NULL DEFAULT 12,
    "receivedAmount" REAL,
    "overpaid" BOOLEAN NOT NULL DEFAULT false,
    "underpaid" BOOLEAN NOT NULL DEFAULT false,
    "slippageTolerance" REAL NOT NULL DEFAULT 0.01,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "confirmedAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "DepositOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HDWalletConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "network" TEXT NOT NULL,
    "xpub" TEXT NOT NULL,
    "derivationPath" TEXT NOT NULL,
    "lastUsedIndex" INTEGER NOT NULL DEFAULT 0,
    "nextUnusedIndex" INTEGER NOT NULL DEFAULT 0,
    "coldWalletAddress" TEXT NOT NULL,
    "sweepThreshold" REAL NOT NULL,
    "sweepMinAmount" REAL NOT NULL DEFAULT 0.001,
    "chainId" INTEGER NOT NULL,
    "rpcUrl" TEXT NOT NULL,
    "explorerUrl" TEXT NOT NULL,
    "alchemyApiKey" TEXT,
    "webhookId" TEXT,
    "webhookSignature" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WalletAddress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hdWalletConfigId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "derivationPath" TEXT NOT NULL,
    "derivationIndex" INTEGER NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "firstUsedAt" DATETIME,
    "lastUsedAt" DATETIME,
    "totalReceived" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSwept" BOOLEAN NOT NULL DEFAULT false,
    "sweptAt" DATETIME,
    "privateKeyEncrypted" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WalletAddress_hdWalletConfigId_fkey" FOREIGN KEY ("hdWalletConfigId") REFERENCES "HDWalletConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "webhookId" TEXT,
    "source" TEXT NOT NULL,
    "eventId" TEXT,
    "payload" TEXT NOT NULL,
    "signature" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processingError" TEXT,
    "processingTime" INTEGER,
    "txHash" TEXT,
    "depositOrderId" TEXT,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME
);

-- CreateTable
CREATE TABLE "NetworkConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "network" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "rpcUrl" TEXT NOT NULL,
    "fallbackRpcUrls" TEXT NOT NULL,
    "explorerUrl" TEXT NOT NULL,
    "apiEndpoint" TEXT,
    "gasPriceMultiplier" REAL NOT NULL DEFAULT 1.1,
    "maxGasPrice" REAL,
    "requiredConfirmations" INTEGER NOT NULL DEFAULT 12,
    "targetConfirmations" INTEGER NOT NULL DEFAULT 12,
    "nativeCurrency" TEXT NOT NULL DEFAULT 'ETH',
    "tokenContracts" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "details" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "relatedUserId" TEXT,
    "relatedOrderId" TEXT,
    "relatedTxHash" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txHash_key" ON "Transaction"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_depositOrderId_key" ON "Transaction"("depositOrderId");

-- CreateIndex
CREATE INDEX "Transaction_walletId_idx" ON "Transaction"("walletId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_referenceId_referenceType_idx" ON "Transaction"("referenceId", "referenceType");

-- CreateIndex
CREATE INDEX "Transaction_txHash_idx" ON "Transaction"("txHash");

-- CreateIndex
CREATE INDEX "Transaction_depositOrderId_idx" ON "Transaction"("depositOrderId");

-- CreateIndex
CREATE INDEX "Transaction_verified_network_idx" ON "Transaction"("verified", "network");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_slug_key" ON "Asset"("slug");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "Asset_type_idx" ON "Asset"("type");

-- CreateIndex
CREATE INDEX "Asset_slug_idx" ON "Asset"("slug");

-- CreateIndex
CREATE INDEX "Asset_createdAt_idx" ON "Asset"("createdAt");

-- CreateIndex
CREATE INDEX "Asset_featured_idx" ON "Asset"("featured");

-- CreateIndex
CREATE INDEX "Asset_deliveryType_idx" ON "Asset"("deliveryType");

-- CreateIndex
CREATE INDEX "Asset_profitDistributionTiming_idx" ON "Asset"("profitDistributionTiming");

-- CreateIndex
CREATE UNIQUE INDEX "AssetRequest_assetId_key" ON "AssetRequest"("assetId");

-- CreateIndex
CREATE INDEX "AssetRequest_status_idx" ON "AssetRequest"("status");

-- CreateIndex
CREATE INDEX "AssetRequest_userId_idx" ON "AssetRequest"("userId");

-- CreateIndex
CREATE INDEX "AssetRequest_createdAt_idx" ON "AssetRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Vote_assetRequestId_idx" ON "Vote"("assetRequestId");

-- CreateIndex
CREATE INDEX "Vote_voteType_idx" ON "Vote"("voteType");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_assetRequestId_key" ON "Vote"("userId", "assetRequestId");

-- CreateIndex
CREATE INDEX "Contribution_assetId_idx" ON "Contribution"("assetId");

-- CreateIndex
CREATE INDEX "Contribution_userId_idx" ON "Contribution"("userId");

-- CreateIndex
CREATE INDEX "Contribution_status_idx" ON "Contribution"("status");

-- CreateIndex
CREATE INDEX "Contribution_isInvestment_idx" ON "Contribution"("isInvestment");

-- CreateIndex
CREATE INDEX "ProfitShare_contributionId_idx" ON "ProfitShare"("contributionId");

-- CreateIndex
CREATE INDEX "ProfitShare_assetId_idx" ON "ProfitShare"("assetId");

-- CreateIndex
CREATE INDEX "ProfitShare_userId_idx" ON "ProfitShare"("userId");

-- CreateIndex
CREATE INDEX "ProfitShare_distributedAt_idx" ON "ProfitShare"("distributedAt");

-- CreateIndex
CREATE INDEX "AssetPurchase_assetId_idx" ON "AssetPurchase"("assetId");

-- CreateIndex
CREATE INDEX "AssetPurchase_userId_idx" ON "AssetPurchase"("userId");

-- CreateIndex
CREATE INDEX "AssetPurchase_createdAt_idx" ON "AssetPurchase"("createdAt");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_walletId_idx" ON "WithdrawalRequest"("walletId");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_userId_idx" ON "WithdrawalRequest"("userId");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_status_idx" ON "WithdrawalRequest"("status");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_createdAt_idx" ON "WithdrawalRequest"("createdAt");

-- CreateIndex
CREATE INDEX "ProfitDistribution_assetId_idx" ON "ProfitDistribution"("assetId");

-- CreateIndex
CREATE INDEX "ProfitDistribution_distributionDate_idx" ON "ProfitDistribution"("distributionDate");

-- CreateIndex
CREATE UNIQUE INDEX "DepositOrder_depositAddress_key" ON "DepositOrder"("depositAddress");

-- CreateIndex
CREATE UNIQUE INDEX "DepositOrder_txHash_key" ON "DepositOrder"("txHash");

-- CreateIndex
CREATE INDEX "DepositOrder_userId_idx" ON "DepositOrder"("userId");

-- CreateIndex
CREATE INDEX "DepositOrder_status_idx" ON "DepositOrder"("status");

-- CreateIndex
CREATE INDEX "DepositOrder_depositAddress_idx" ON "DepositOrder"("depositAddress");

-- CreateIndex
CREATE INDEX "DepositOrder_txHash_idx" ON "DepositOrder"("txHash");

-- CreateIndex
CREATE INDEX "DepositOrder_expiresAt_idx" ON "DepositOrder"("expiresAt");

-- CreateIndex
CREATE INDEX "DepositOrder_createdAt_idx" ON "DepositOrder"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HDWalletConfig_network_key" ON "HDWalletConfig"("network");

-- CreateIndex
CREATE INDEX "HDWalletConfig_network_idx" ON "HDWalletConfig"("network");

-- CreateIndex
CREATE INDEX "WalletAddress_address_idx" ON "WalletAddress"("address");

-- CreateIndex
CREATE INDEX "WalletAddress_isUsed_idx" ON "WalletAddress"("isUsed");

-- CreateIndex
CREATE INDEX "WalletAddress_isSwept_idx" ON "WalletAddress"("isSwept");

-- CreateIndex
CREATE UNIQUE INDEX "WalletAddress_hdWalletConfigId_derivationIndex_key" ON "WalletAddress"("hdWalletConfigId", "derivationIndex");

-- CreateIndex
CREATE INDEX "WebhookLog_source_eventId_idx" ON "WebhookLog"("source", "eventId");

-- CreateIndex
CREATE INDEX "WebhookLog_txHash_idx" ON "WebhookLog"("txHash");

-- CreateIndex
CREATE INDEX "WebhookLog_depositOrderId_idx" ON "WebhookLog"("depositOrderId");

-- CreateIndex
CREATE INDEX "WebhookLog_processed_idx" ON "WebhookLog"("processed");

-- CreateIndex
CREATE UNIQUE INDEX "NetworkConfig_network_key" ON "NetworkConfig"("network");

-- CreateIndex
CREATE INDEX "NetworkConfig_isActive_idx" ON "NetworkConfig"("isActive");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");
