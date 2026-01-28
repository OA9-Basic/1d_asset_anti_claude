/**
 * WITHDRAWAL TRANSACTION SIGNING SERVICE
 * Handles signing and sending cryptocurrency withdrawal transactions
 * using ethers.js with private key authentication
 */

import { ethers } from 'ethers';

import { createLogger } from '@/lib/logger';

import { NETWORKS, TOKEN_CONTRACTS } from './alchemy';

const logger = createLogger('blockchain:withdrawal');

// ERC-20 Transfer ABI (only the function we need)
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

// Token decimals for common cryptocurrencies
const TOKEN_DECIMALS: Record<string, number> = {
  USDT: 6,  // USDT uses 6 decimals on most chains
  USDC: 6,  // USDC uses 6 decimals
  USDC_E: 6, // USDC Enterprise
  DAI: 18, // DAI uses 18 decimals
  WBTC: 8, // Wrapped BTC uses 8 decimals
};

// Network mapping for crypto currencies
const CURRENCY_NETWORK_MAP: Record<string, keyof typeof NETWORKS> = {
  ETH: 'ETHEREUM_MAINNET',
  USDT: 'POLYGON_MAINNET', // USDT on Polygon has lower fees
  USDC: 'POLYGON_MAINNET', // USDC on Polygon has lower fees
  XMR: 'ETHEREUM_MAINNET',  // Placeholder - Monero not supported
  LTC: 'ETHEREUM_MAINNET',  // Placeholder - Litecoin not supported
  BCH: 'ETHEREUM_MAINNET',  // Placeholder - Bitcoin Cash not supported
  BTC: 'ETHEREUM_MAINNET',  // Placeholder - Bitcoin not supported
};

// Token contract addresses for ERC20 tokens
const TOKEN_ADDRESSES: Record<string, { network: keyof typeof NETWORKS; address: string }> = {
  USDT_POLYGON: { network: 'POLYGON_MAINNET', address: TOKEN_CONTRACTS.POLYGON.USDT },
  USDT_BSC: { network: 'BSC_MAINNET', address: TOKEN_CONTRACTS.BSC.USDT },
  USDC_POLYGON: { network: 'POLYGON_MAINNET', address: TOKEN_CONTRACTS.POLYGON.USDC },
  USDC_BSC: { network: 'BSC_MAINNET', address: TOKEN_CONTRACTS.BSC.USDC },
};

export interface WithdrawalRequest {
  toAddress: string;
  amount: number; // Amount in base currency (e.g., dollars for USDT)
  currency: string; // BTC, ETH, USDT, USDC, XMR, LTC, BCH
  network?: keyof typeof NETWORKS; // Optional network override
}

export interface WithdrawalResult {
  success: boolean;
  txHash?: string;
  blockNumber?: number;
  gasUsed?: bigint;
  actualAmount?: string;
  error?: string;
}

/**
 * Validate wallet address format
 */
export function validateAddress(address: string, network: keyof typeof NETWORKS): boolean {
  try {
    ethers.getAddress(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get token contract address for currency and network
 */
function getTokenContractInfo(
  currency: string,
  network: keyof typeof NETWORKS
): { address: string; decimals: number } | null {
  const key = `${currency}_${network}`;

  // Check specific network mapping
  if (key === 'USDT_POLYGON') {
    return { address: TOKEN_CONTRACTS.POLYGON.USDT, decimals: TOKEN_DECIMALS.USDT };
  }
  if (key === 'USDT_BSC') {
    return { address: TOKEN_CONTRACTS.BSC.USDT, decimals: TOKEN_DECIMALS.USDT };
  }
  if (key === 'USDC_POLYGON') {
    return { address: TOKEN_CONTRACTS.POLYGON.USDC, decimals: TOKEN_DECIMALS.USDC };
  }
  if (key === 'USDC_BSC') {
    return { address: TOKEN_CONTRACTS.BSC.USDC, decimals: TOKEN_DECIMALS.USDC };
  }

  return null;
}

/**
 * Send native currency withdrawal (ETH, BNB, MATIC)
 */
async function sendNativeWithdrawal(
  toAddress: string,
  amountInBaseUnits: bigint,
  network: keyof typeof NETWORKS,
  privateKey: string
): Promise<WithdrawalResult> {
  const config = NETWORKS[network];
  if (!config) {
    return { success: false, error: `Unsupported network: ${network}` };
  }

  try {
    // Create wallet with provider
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Get current gas price
    const gasPrice = await provider.getFeeData();
    const maxFeePerGas = gasPrice.maxFeePerGas || gasPrice.gasPrice;
    const maxPriorityFeePerGas = gasPrice.maxPriorityFeePerGas;

    if (!maxFeePerGas) {
      return { success: false, error: 'Failed to get gas price' };
    }

    // Estimate gas limit
    const gasLimit = BigInt(21000); // Standard ETH transfer gas limit

    // Calculate total cost
    const totalCost = amountInBaseUnits + gasLimit * maxFeePerGas;

    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    if (balance < totalCost) {
      return {
        success: false,
        error: `Insufficient balance. Required: ${ethers.formatEther(totalCost)} ${config.nativeCurrency}, Available: ${ethers.formatEther(balance)}`,
      };
    }

    logger.info(
      {
        to: toAddress,
        amount: ethers.formatEther(amountInBaseUnits),
        network: config.name,
        gasPrice: ethers.formatUnits(maxFeePerGas, 'gwei'),
      },
      'Sending native currency withdrawal'
    );

    // Send transaction
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: amountInBaseUnits,
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
    });

    logger.info({ txHash: tx.hash }, 'Transaction sent, waiting for confirmation...');

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    if (!receipt) {
      return { success: false, error: 'Transaction failed to confirm' };
    }

    logger.info(
      {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      },
      'Withdrawal transaction confirmed'
    );

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
      actualAmount: ethers.formatEther(amountInBaseUnits),
    };
  } catch (error) {
    logger.error({ error }, 'Native withdrawal failed');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send ERC-20 token withdrawal (USDT, USDC, etc.)
 */
async function sendTokenWithdrawal(
  toAddress: string,
  amountInBaseUnits: bigint,
  tokenAddress: string,
  decimals: number,
  network: keyof typeof NETWORKS,
  privateKey: string
): Promise<WithdrawalResult> {
  const config = NETWORKS[network];
  if (!config) {
    return { success: false, error: `Unsupported network: ${network}` };
  }

  try {
    // Create wallet with provider
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Create token contract instance
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

    // Check token balance
    const balance: bigint = await tokenContract.balanceOf(wallet.address);
    if (balance < amountInBaseUnits) {
      return {
        success: false,
        error: `Insufficient token balance. Required: ${ethers.formatUnits(amountInBaseUnits, decimals)}, Available: ${ethers.formatUnits(balance, decimals)}`,
      };
    }

    // Check native currency balance for gas
    const nativeBalance = await provider.getBalance(wallet.address);
    if (nativeBalance === BigInt(0)) {
      return {
        success: false,
        error: `Insufficient ${config.nativeCurrency} balance for gas fees`,
      };
    }

    logger.info(
      {
        token: tokenAddress,
        to: toAddress,
        amount: ethers.formatUnits(amountInBaseUnits, decimals),
        network: config.name,
      },
      'Sending ERC-20 token withdrawal'
    );

    // Estimate gas for transfer
    const gasEstimate = await tokenContract.transfer.estimateGas(toAddress, amountInBaseUnits);
    const gasLimit = gasEstimate * BigInt(120) / BigInt(100); // Add 20% buffer

    // Get gas price
    const gasPrice = await provider.getFeeData();
    const maxFeePerGas = gasPrice.maxFeePerGas || gasPrice.gasPrice;
    const maxPriorityFeePerGas = gasPrice.maxPriorityFeePerGas;

    if (!maxFeePerGas) {
      return { success: false, error: 'Failed to get gas price' };
    }

    // Send transaction
    const tx = await tokenContract.transfer(toAddress, amountInBaseUnits, {
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
    });

    logger.info({ txHash: tx.hash }, 'Token transfer transaction sent, waiting for confirmation...');

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    if (!receipt) {
      return { success: false, error: 'Transaction failed to confirm' };
    }

    logger.info(
      {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      },
      'Token withdrawal confirmed'
    );

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
      actualAmount: ethers.formatUnits(amountInBaseUnits, decimals),
    };
  } catch (error) {
    logger.error({ error }, 'Token withdrawal failed');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process withdrawal request
 *
 * This function handles the complete withdrawal flow:
 * 1. Validates the withdrawal request
 * 2. Determines the appropriate network
 * 3. Converts amount to blockchain units
 * 4. Signs and sends the transaction
 * 5. Waits for confirmation
 *
 * @param request - Withdrawal request details
 * @param privateKey - Private key for signing (should come from environment variable)
 * @returns Withdrawal result with transaction hash or error
 */
export async function processWithdrawal(
  request: WithdrawalRequest,
  privateKey?: string
): Promise<WithdrawalResult> {
  // Validate private key
  const signingKey = privateKey || process.env.WALLET_PRIVATE_KEY;

  if (!signingKey) {
    logger.error('WALLET_PRIVATE_KEY not configured');
    return {
      success: false,
      error: 'Wallet private key not configured. Set WALLET_PRIVATE_KEY environment variable.',
    };
  }

  // Validate private key format
  try {
    new ethers.Wallet(signingKey);
  } catch {
    return { success: false, error: 'Invalid private key format' };
  }

  // Determine network
  const network = request.network || CURRENCY_NETWORK_MAP[request.currency];

  if (!network) {
    return {
      success: false,
      error: `Unsupported currency: ${request.currency}. Supported: ${Object.keys(CURRENCY_NETWORK_MAP).join(', ')}`,
    };
  }

  const config = NETWORKS[network];
  if (!config) {
    return { success: false, error: `Network configuration not found for: ${network}` };
  }

  // Validate recipient address
  if (!validateAddress(request.toAddress, network)) {
    return {
      success: false,
      error: `Invalid ${config.name} address format: ${request.toAddress}`,
    };
  }

  // Handle native currency withdrawals (ETH, BNB, MATIC)
  if (request.currency === 'ETH' || request.currency === config.nativeCurrency) {
    const amountInWei = ethers.parseEther(request.amount.toString());
    return sendNativeWithdrawal(request.toAddress, amountInWei, network, signingKey);
  }

  // Handle ERC-20 token withdrawals
  const tokenInfo = getTokenContractInfo(request.currency, network);

  if (tokenInfo) {
    // Convert amount to token units (USDT/USDC use 6 decimals)
    const decimals = tokenInfo.decimals;
    const amountInTokenUnits = ethers.parseUnits(request.amount.toString(), decimals);
    return sendTokenWithdrawal(
      request.toAddress,
      amountInTokenUnits,
      tokenInfo.address,
      decimals,
      network,
      signingKey
    );
  }

  // Unsupported currency
  return {
    success: false,
    error: `Currency ${request.currency} is not supported on ${network}. Supported tokens on this network: USDT, USDC`,
  };
}

/**
 * Get wallet address from private key
 */
export function getWalletAddress(privateKey?: string): string {
  const signingKey = privateKey || process.env.WALLET_PRIVATE_KEY;

  if (!signingKey) {
    throw new Error('WALLET_PRIVATE_KEY not configured');
  }

  const wallet = new ethers.Wallet(signingKey);
  return wallet.address;
}

/**
 * Get wallet balance (native + tokens)
 */
export async function getWalletBalance(
  network: keyof typeof NETWORKS,
  privateKey?: string
): Promise<{
  native: { balance: string; symbol: string };
  tokens: Array<{ symbol: string; balance: string; address: string }>;
}> {
  const signingKey = privateKey || process.env.WALLET_PRIVATE_KEY;

  if (!signingKey) {
    throw new Error('WALLET_PRIVATE_KEY not configured');
  }

  const config = NETWORKS[network];
  if (!config) {
    throw new Error(`Invalid network: ${network}`);
  }

  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(signingKey, provider);

  // Get native balance
  const nativeBalance = await provider.getBalance(wallet.address);

  const result = {
    native: {
      balance: ethers.formatEther(nativeBalance),
      symbol: config.nativeCurrency,
    },
    tokens: [] as Array<{ symbol: string; balance: string; address: string }>,
  };

  // Get token balances if on Polygon or BSC
  if (network === 'POLYGON_MAINNET') {
    const tokenContracts = [
      { address: TOKEN_CONTRACTS.POLYGON.USDT, symbol: 'USDT' },
      { address: TOKEN_CONTRACTS.POLYGON.USDC, symbol: 'USDC' },
    ];

    for (const token of tokenContracts) {
      try {
        const contract = new ethers.Contract(token.address, ERC20_ABI, wallet);
        const balance: bigint = await contract.balanceOf(wallet.address);
        const decimals = TOKEN_DECIMALS[token.symbol as keyof typeof TOKEN_DECIMALS] || 18;

        result.tokens.push({
          symbol: token.symbol,
          balance: ethers.formatUnits(balance, decimals),
          address: token.address,
        });
      } catch {
        // Skip failed token checks
      }
    }
  } else if (network === 'BSC_MAINNET') {
    const tokenContracts = [
      { address: TOKEN_CONTRACTS.BSC.USDT, symbol: 'USDT' },
      { address: TOKEN_CONTRACTS.BSC.USDC, symbol: 'USDC' },
    ];

    for (const token of tokenContracts) {
      try {
        const contract = new ethers.Contract(token.address, ERC20_ABI, wallet);
        const balance: bigint = await contract.balanceOf(wallet.address);
        const decimals = TOKEN_DECIMALS[token.symbol as keyof typeof TOKEN_DECIMALS] || 18;

        result.tokens.push({
          symbol: token.symbol,
          balance: ethers.formatUnits(balance, decimals),
          address: token.address,
        });
      } catch {
        // Skip failed token checks
      }
    }
  }

  return result;
}

/**
 * Estimate withdrawal gas fees
 */
export async function estimateWithdrawalFees(
  request: WithdrawalRequest,
  privateKey?: string
): Promise<{
  success: boolean;
  gasFee?: string;
  gasPrice?: string;
  gasLimit?: string;
  totalCost?: string;
  error?: string;
}> {
  const signingKey = privateKey || process.env.WALLET_PRIVATE_KEY;

  if (!signingKey) {
    return { success: false, error: 'WALLET_PRIVATE_KEY not configured' };
  }

  const network = request.network || CURRENCY_NETWORK_MAP[request.currency];

  if (!network) {
    return { success: false, error: `Unsupported currency: ${request.currency}` };
  }

  const config = NETWORKS[network];
  if (!config) {
    return { success: false, error: `Network configuration not found` };
  }

  try {
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);

    // Get gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.maxFeePerGas || feeData.gasPrice;

    if (!gasPrice) {
      return { success: false, error: 'Failed to get gas price' };
    }

    // Native currency withdrawal
    if (request.currency === 'ETH' || request.currency === config.nativeCurrency) {
      const gasLimit = BigInt(21000);
      const totalFee = gasLimit * gasPrice;

      return {
        success: true,
        gasFee: ethers.formatEther(totalFee),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        gasLimit: gasLimit.toString(),
        totalCost: ethers.formatEther(totalFee + ethers.parseEther(request.amount.toString())),
      };
    }

    // ERC-20 token withdrawal
    const tokenInfo = getTokenContractInfo(request.currency, network);
    if (tokenInfo) {
      const wallet = new ethers.Wallet(signingKey, provider);
      const tokenContract = new ethers.Contract(tokenInfo.address, ERC20_ABI, wallet);

      const decimals = tokenInfo.decimals;
      const amountInTokenUnits = ethers.parseUnits(request.amount.toString(), decimals);

      // Estimate gas
      const gasEstimate = await tokenContract.transfer.estimateGas(
        request.toAddress,
        amountInTokenUnits
      );
      const gasLimit = gasEstimate * BigInt(120) / BigInt(100); // Add 20% buffer
      const totalFee = gasLimit * gasPrice;

      return {
        success: true,
        gasFee: ethers.formatEther(totalFee),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        gasLimit: gasLimit.toString(),
        totalCost: ethers.formatEther(totalFee),
      };
    }

    return { success: false, error: `Currency ${request.currency} not supported` };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Estimation failed',
    };
  }
}
