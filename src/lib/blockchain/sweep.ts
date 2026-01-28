/**
 * COLD STORAGE SWEEP SERVICE
 * Automatically forwards funds from hot wallets to cold storage
 * Runs when deposit balance exceeds threshold
 */

import { ethers } from 'ethers';

import { NETWORKS } from '@/lib/blockchain/alchemy';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { createLogger, logError } from '@/lib/logger';

const logger = createLogger('blockchain:sweep');

// Get RPC URL from network config
function getNetworkRpcUrl(network: keyof typeof NETWORKS): string {
  return NETWORKS[network].rpcUrl;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

interface SweepConfig {
  network: string;
  minBalance: number; // Minimum balance in native currency to trigger sweep
  coldWalletAddress: string;
  gasMultiplier: number; // Multiplier for estimated gas (default 1.2x)
}

const SWEEP_CONFIGS: Record<string, SweepConfig> = {
  ETHEREUM_MAINNET: {
    network: 'ETHEREUM_MAINNET',
    minBalance: 0.01, // 0.01 ETH
    coldWalletAddress: process.env.COLD_WALLET_ETH || '',
    gasMultiplier: 1.2,
  },
  POLYGON_MAINNET: {
    network: 'POLYGON_MAINNET',
    minBalance: 1, // 1 MATIC
    coldWalletAddress: process.env.COLD_WALLET_POLYGON || '',
    gasMultiplier: 1.2,
  },
  BSC_MAINNET: {
    network: 'BSC_MAINNET',
    minBalance: 0.01, // 0.01 BNB
    coldWalletAddress: process.env.COLD_WALLET_BSC || '',
    gasMultiplier: 1.2,
  },
};

// ERC20 Token sweep (for USDT, USDC)
interface TokenSweepConfig {
  tokenAddress: string;
  decimals: number;
  minBalance: number;
}

const TOKEN_SWEEP_CONFIGS: Record<string, TokenSweepConfig> = {
  USDT_POLYGON: {
    tokenAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    decimals: 6,
    minBalance: 10, // 10 USDT
  },
  USDC_POLYGON: {
    tokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    decimals: 6,
    minBalance: 10, // 10 USDC
  },
  USDT_BSC: {
    tokenAddress: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    minBalance: 10, // 10 USDT
  },
  USDC_BSC: {
    tokenAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    decimals: 18,
    minBalance: 10, // 10 USDC
  },
};

// ============================================================================
// SWEEP FUNCTIONS
// ============================================================================

/**
 * Check if a deposit address needs sweeping
 */
export async function checkSweepRequired(depositOrderId: string): Promise<boolean> {
  const depositOrder = await db.depositOrder.findUnique({
    where: { id: depositOrderId },
  });

  if (!depositOrder || !depositOrder.txHash) {
    return false;
  }

  const config = SWEEP_CONFIGS[depositOrder.network];
  if (!config || !config.coldWalletAddress) {
    return false;
  }

  try {
    const rpcUrl = getNetworkRpcUrl(
      depositOrder.network === 'ETHEREUM_MAINNET' ? 'ETHEREUM' :
      depositOrder.network === 'POLYGON_MAINNET' ? 'POLYGON' :
      'BSC'
    );
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Get balance
    const balance = await provider.getBalance(depositOrder.depositAddress);

    // Check if balance exceeds minimum
    const balanceInEth = Number(ethers.formatEther(balance));
    return balanceInEth >= config.minBalance;
  } catch (error) {
    logError(error, 'check_sweep_required_failed', { depositOrderId });
    return false;
  }
}

/**
 * Execute sweep to cold storage
 */
export async function executeSweep(depositOrderId: string): Promise<string> {
  const depositOrder = await db.depositOrder.findUnique({
    where: { id: depositOrderId },
  });

  if (!depositOrder) {
    throw new Error('Deposit order not found');
  }

  const config = SWEEP_CONFIGS[depositOrder.network];
  if (!config || !config.coldWalletAddress) {
    throw new Error(`No sweep config for ${depositOrder.network}`);
  }

  if (!depositOrder.privateKeyEncrypted) {
    throw new Error('No private key available for this deposit');
  }

  // Decrypt private key
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY not configured');
  }

  const privateKey = await decrypt(depositOrder.privateKeyEncrypted, encryptionKey);

  // Create wallet and provider
  const rpcUrl = getNetworkRpcUrl(
    depositOrder.network === 'ETHEREUM_MAINNET' ? 'ETHEREUM' :
    depositOrder.network === 'POLYGON_MAINNET' ? 'POLYGON' :
    'BSC'
  );
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Get balance
  const balance = await provider.getBalance(wallet.address);

  if (balance === BigInt(0)) {
    throw new Error('No balance to sweep');
  }

  // Estimate gas
  const gasPrice = await provider.getFeeData();
  const estimatedGas = BigInt(21000); // Standard transfer
  const gasCost = (gasPrice.gasPrice || BigInt(0)) * estimatedGas;

  // Calculate amount to send
  const amountToSend = balance - gasCost;

  if (amountToSend <= BigInt(0)) {
    throw new Error('Insufficient balance to cover gas');
  }

  // Send transaction
  const tx = await wallet.sendTransaction({
    to: config.coldWalletAddress,
    value: amountToSend,
  });

  // Wait for confirmation
  const receipt = await tx.wait();

  if (!receipt) {
    throw new Error('Sweep transaction failed');
  }

  // Log sweep in database
  await db.auditLog.create({
    data: {
      userId: depositOrder.userId,
      relatedOrderId: depositOrderId,
      relatedTxHash: receipt.hash,
      action: 'SWEEP_TO_COLD_STORAGE',
      category: 'CRYPTO',
      severity: 'INFO',
      success: true,
      details: JSON.stringify({
        from: wallet.address,
        to: config.coldWalletAddress,
        amount: ethers.formatEther(amountToSend),
        network: depositOrder.network,
        gasUsed: receipt.gasUsed.toString(),
      }),
    },
  });

  return receipt.hash;
}

/**
 * Execute ERC20 token sweep
 */
export async function executeTokenSweep(
  depositOrderId: string,
  tokenSymbol: string
): Promise<string> {
  const depositOrder = await db.depositOrder.findUnique({
    where: { id: depositOrderId },
  });

  if (!depositOrder) {
    throw new Error('Deposit order not found');
  }

  const tokenConfig = TOKEN_SWEEP_CONFIGS[tokenSymbol];
  if (!tokenConfig) {
    throw new Error(`No token config for ${tokenSymbol}`);
  }

  const coldWalletAddress = process.env.COLD_WALLET_ETH; // Use same cold wallet for tokens
  if (!coldWalletAddress) {
    throw new Error('COLD_WALLET_ETH not configured');
  }

  if (!depositOrder.privateKeyEncrypted) {
    throw new Error('No private key available for this deposit');
  }

  // Decrypt private key
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY not configured');
  }

  const privateKey = await decrypt(depositOrder.privateKeyEncrypted, encryptionKey);

  // Create wallet and provider
  const network = tokenSymbol.includes('POLYGON') ? 'POLYGON' : 'BSC';
  const rpcUrl = getNetworkRpcUrl(network);
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // ERC20 ABI for transfer
  const erc20Abi = [
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
  ];

  const tokenContract = new ethers.Contract(tokenConfig.tokenAddress, erc20Abi, wallet);

  // Get token balance
  const balance = await tokenContract.balanceOf(wallet.address);

  if (balance === BigInt(0)) {
    throw new Error('No token balance to sweep');
  }

  // Execute transfer
  const tx = await tokenContract.transfer(coldWalletAddress, balance);

  // Wait for confirmation
  const receipt = await tx.wait();

  if (!receipt) {
    throw new Error('Token sweep transaction failed');
  }

  // Log sweep
  await db.auditLog.create({
    data: {
      userId: depositOrder.userId,
      relatedOrderId: depositOrderId,
      relatedTxHash: receipt.hash,
      action: 'TOKEN_SWEEP_TO_COLD_STORAGE',
      category: 'CRYPTO',
      severity: 'INFO',
      success: true,
      details: JSON.stringify({
        token: tokenSymbol,
        from: wallet.address,
        to: coldWalletAddress,
        amount: ethers.formatUnits(balance, tokenConfig.decimals),
        network,
      }),
    },
  });

  return receipt.hash;
}

/**
 * Automatic sweep check and execution
 * Call this after verifying a deposit
 */
export async function autoSweepIfRequired(depositOrderId: string): Promise<void> {
  try {
    const depositOrder = await db.depositOrder.findUnique({
      where: { id: depositOrderId },
    });

    if (!depositOrder) return;

    // Check if sweep is required
    const needsSweep = await checkSweepRequired(depositOrderId);
    if (!needsSweep) return;

    logger.info({ depositOrderId, network: depositOrder.network }, 'Executing auto-sweep');

    // Execute sweep
    await executeSweep(depositOrderId);

    // If it's a token deposit, also sweep tokens
    if (depositOrder.cryptoCurrency.startsWith('USDT') ||
        depositOrder.cryptoCurrency.startsWith('USDC')) {
      await executeTokenSweep(
        depositOrderId,
        depositOrder.cryptoCurrency
      );
    }
  } catch (error) {
    // Silently handle sweep failures
    logError(error, 'auto_sweep_failed', { depositOrderId });

    // Log failure but don't throw - we don't want to break deposit verification
    await db.auditLog.create({
      data: {
        action: 'AUTO_SWEEP_FAILED',
        category: 'CRYPTO',
        severity: 'WARNING',
        success: false,
        details: JSON.stringify({
          depositOrderId,
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      },
    }).catch(() => {});
  }
}
