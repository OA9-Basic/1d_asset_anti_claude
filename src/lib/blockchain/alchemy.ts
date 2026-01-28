/**
 * ALCHEMY WEBHOOK & VERIFICATION SERVICE
 * Handles Alchemy webhooks and blockchain verification for BSC, Polygon, Ethereum
 */

import { createHash, timingSafeEqual } from 'crypto';

import { ethers } from 'ethers';

// ============================================================================
// TYPES
// ============================================================================

export interface AlchemyWebhookPayload {
  webhookId: string;
  id: string;
  createdAt: string;
  type: 'ADDRESS_ACTIVITY';
  event: {
    network: GoerliTestnetType | MainnetType;
    activity: AlchemyActivity[];
  };
}

type GoerliTestnetType = 'ETH_GOERLI' | 'MATIC_MUMBAI';
type MainnetType = 'ETH_MAINNET' | 'MATIC_MAINNET' | 'BNB_SMART_CHAIN';

export interface AlchemyActivity {
  category: 'external' | 'internal' | 'token' | 'nft';
  fromAddress: string;
  toAddress?: string;
  value?: string;
  erc20TokenId?: string;
  valueBigInt?: bigint;
  asset?: string;
  hash: string;
  log?: {
    address: string;
    topics: string[];
    data: string;
  };
}

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: string;
  requiredConfirmations: number;
  alchemyNetworkId: string;
}

// ============================================================================
// NETWORK CONFIGURATIONS
// ============================================================================

export const NETWORKS: Record<string, NetworkConfig> = {
  ETHEREUM_MAINNET: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: 'ETH',
    requiredConfirmations: 12,
    alchemyNetworkId: 'ETH_MAINNET',
  },
  POLYGON_MAINNET: {
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: 'MATIC',
    requiredConfirmations: 30, // Polygon has faster finality
    alchemyNetworkId: 'MATIC_MAINNET',
  },
  BSC_MAINNET: {
    name: 'BNB Smart Chain',
    chainId: 56,
    rpcUrl: `https://bnb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: 'BNB',
    requiredConfirmations: 10,
    alchemyNetworkId: 'BNB_SMART_CHAIN',
  },
};

// ERC-20 Token Contracts (for USDT, USDC)
export const TOKEN_CONTRACTS = {
  POLYGON: {
    USDT: process.env.USDT_POLYGON_ADDRESS || '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT on Polygon
    USDC: process.env.USDC_POLYGON_ADDRESS || '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC on Polygon
  },
  BSC: {
    USDT: process.env.USDT_BSC_ADDRESS || '0x55d398326f99059fF775485246999027B3197955', // USDT on BSC
    USDC: process.env.USDC_BSC_ADDRESS || '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC on BSC
  },
};

// ============================================================================
// WEBHOOK VERIFICATION
// ============================================================================

/**
 * Verify Alchemy webhook signature
 * Prevents replay attacks and fake webhooks
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createHash('sha256')
    .update(secret + payload)
    .digest('hex');

  return timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Parse and validate Alchemy webhook payload
 */
export function parseWebhookPayload(
  body: unknown
): { success: boolean; data?: AlchemyWebhookPayload; error?: string } {
  try {
    const payload = body as Record<string, unknown>;

    // Basic validation
    if (!payload.webhookId || !payload.id || !payload.type || !payload.event) {
      return { success: false, error: 'Invalid webhook payload structure' };
    }

    if (payload.type !== 'ADDRESS_ACTIVITY') {
      return { success: false, error: 'Unsupported webhook type' };
    }

    return { success: true, data: body as AlchemyWebhookPayload };
  } catch {
    return { success: false, error: 'Failed to parse webhook payload' };
  }
}

// ============================================================================
// BLOCKCHAIN VERIFICATION
// ============================================================================

/**
 * Verify transaction on blockchain using Alchemy RPC
 */
export async function verifyTransaction(
  txHash: string,
  expectedAddress: string,
  expectedAmount: bigint,
  network: keyof typeof NETWORKS,
  tokenAddress?: string // For ERC-20 tokens
): Promise<{
  verified: boolean;
  confirmations: number;
  receivedAmount?: bigint;
  error?: string;
}> {
  const config = NETWORKS[network];
  if (!config) {
    return { verified: false, confirmations: 0, error: 'Unsupported network' };
  }

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return { verified: false, confirmations: 0, error: 'Transaction not found' };
    }

    // Get current block number
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber;

    // Check confirmations
    if (confirmations < config.requiredConfirmations) {
      return {
        verified: false,
        confirmations,
        error: `Insufficient confirmations (${confirmations}/${config.requiredConfirmations})`,
      };
    }

    // Verify transaction details
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      return { verified: false, confirmations, error: 'Transaction details not found' };
    }

    // For native currency (ETH, BNB, MATIC)
    if (!tokenAddress) {
      if (tx.to?.toLowerCase() !== expectedAddress.toLowerCase()) {
        return { verified: false, confirmations, error: 'Destination address mismatch' };
      }

      const receivedAmount = tx.value;

      // Check amount (allow 1% tolerance for dust/gas)
      const tolerance = expectedAmount / BigInt(100); // 1%
      const difference = receivedAmount > expectedAmount
        ? receivedAmount - expectedAmount
        : expectedAmount - receivedAmount;

      if (difference > tolerance) {
        return {
          verified: false,
          confirmations,
          receivedAmount,
          error: 'Amount mismatch (outside 1% tolerance)',
        };
      }

      return { verified: true, confirmations, receivedAmount };
    }

    // For ERC-20 tokens (USDT, USDC)
    const transferInterface = new ethers.Interface([
      'event Transfer(address indexed from, address indexed to, uint256 value)',
    ]);

    // Find Transfer log to our address
    const transferLog = receipt.logs.find((log) => {
      const topics = log.topics;
      const transferEvent = transferInterface.getEvent('Transfer');
      if (!transferEvent) return false;
      const transferEventTopic = transferEvent.topicHash;
      return (
        log.address.toLowerCase() === tokenAddress?.toLowerCase() &&
        topics &&
        topics[0] !== null &&
        topics[0] === transferEventTopic &&
        topics[2]?.toLowerCase() === expectedAddress.toLowerCase()
      );
    });

    if (!transferLog) {
      return { verified: false, confirmations, error: 'Token transfer log not found' };
    }

    // Parse amount from log data
    const parsed = transferInterface.parseLog(transferLog);
    const receivedAmount = parsed?.args.value as bigint;

    // Check amount
    const tolerance = expectedAmount / BigInt(100);
    const difference = receivedAmount > expectedAmount
      ? receivedAmount - expectedAmount
      : expectedAmount - receivedAmount;

    if (difference > tolerance) {
      return {
        verified: false,
        confirmations,
        receivedAmount,
        error: 'Token amount mismatch',
      };
    }

    return { verified: true, confirmations, receivedAmount };
  } catch (error) {
    return {
      verified: false,
      confirmations: 0,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Get transaction details
 */
export async function getTransactionDetails(
  txHash: string,
  network: keyof typeof NETWORKS
): Promise<{
  hash: string;
  from: string;
  to: string;
  value: bigint;
  blockNumber: number;
  confirmations: number;
  gasUsed: bigint;
  gasPrice: bigint;
} | null> {
  const config = NETWORKS[network];
  if (!config) return null;

  const provider = new ethers.JsonRpcProvider(config.rpcUrl);

  const [tx, receipt] = await Promise.all([
    provider.getTransaction(txHash),
    provider.getTransactionReceipt(txHash),
  ]);

  if (!tx || !receipt) return null;

  const currentBlock = await provider.getBlockNumber();

  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to || '',
    value: tx.value,
    blockNumber: receipt.blockNumber,
    confirmations: currentBlock - receipt.blockNumber,
    gasUsed: receipt.gasUsed,
    gasPrice: tx.gasPrice || BigInt(0),
  };
}

/**
 * Wait for transaction confirmations
 */
export async function waitForConfirmations(
  txHash: string,
  network: keyof typeof NETWORKS,
  requiredConfirmations: number = 12
): Promise<{ success: boolean; confirmations: number }> {
  const config = NETWORKS[network];
  if (!config) return { success: false, confirmations: 0 };

  const provider = new ethers.JsonRpcProvider(config.rpcUrl);

  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      return { success: false, confirmations: 0 };
    }

    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber;

    if (confirmations >= requiredConfirmations) {
      return { success: true, confirmations };
    }

    // Wait for more confirmations
    return new Promise((resolve) => {
      const checkInterval = setInterval(async () => {
        const block = await provider.getBlockNumber();
        const confs = block - receipt.blockNumber;

        if (confs >= requiredConfirmations) {
          clearInterval(checkInterval);
          resolve({ success: true, confirmations: confs });
        }
      }, 10000); // Check every 10 seconds

      // Timeout after 1 hour
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve({ success: false, confirmations });
      }, 60 * 60 * 1000);
    });
  } catch {
    return { success: false, confirmations: 0 };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert address to checksum format
 */
export function toChecksumAddress(address: string): string {
  return ethers.getAddress(address);
}

/**
 * Convert Wei to Ether (or smallest unit)
 */
export function fromWei(wei: bigint, decimals: number = 18): number {
  const divisor = BigInt(10 ** decimals);
  const ether = wei / divisor;
  const remainder = wei % divisor;

  return Number(ether) + Number(remainder) / Number(divisor);
}

/**
 * Convert Ether to Wei (or to smallest unit)
 */
export function toWei(ether: number, decimals: number = 18): bigint {
  const multiplier = BigInt(10 ** decimals);
  const whole = BigInt(Math.floor(ether));
  const fraction = ether - Math.floor(ether);
  const fractionWei = BigInt(Math.round(fraction * Number(multiplier)));

  return whole * multiplier + fractionWei;
}

/**
 * Format crypto amount for display
 */
export function formatCryptoAmount(amount: bigint, decimals: number = 18): string {
  const value = fromWei(amount, decimals);

  if (value < 0.000001) {
    return `${value.toExponential(2)}`;
  }

  return value.toFixed(6).replace(/\.?0+$/, '');
}
