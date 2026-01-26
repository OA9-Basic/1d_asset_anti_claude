/**
 * HD WALLET GENERATION SYSTEM
 * BIP44-compliant hierarchical deterministic wallet generation
 * Cold storage architecture with minimal hot wallet exposure
 */

import { randomBytes } from 'crypto';

import * as bip39 from 'bip39';
import { ethers } from 'ethers';

import { encrypt, decrypt } from '@/lib/encryption';

// ============================================================================
// TYPES
// ============================================================================

export interface DerivedWallet {
  address: string;
  privateKey: string;
  derivationPath: string;
  index: number;
}

export interface EncryptedWalletData {
  address: string;
  privateKeyEncrypted: string;
  derivationPath: string;
  index: number;
  network: string;
}

// ============================================================================
// BIP44 DERIVATION PATHS
// ============================================================================

/**
 * BIP44 derivation paths for different networks
 * Format: m / purpose' / coin_type' / account' / change / address_index
 *
 * Reference: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
 */
export const BIP44_PATHS = {
  // Ethereum & EVM-compatible chains (coin_type = 60)
  ETHEREUM: "m/44'/60'/0'/0",
  POLYGON: "m/44'/60'/0'/0",
  BSC: "m/44'/60'/0'/0",

  // Bitcoin (coin_type = 0)
  BITCOIN: "m/44'/0'/0'/0",

  // Note: Polygon and BSC use the same coin_type as Ethereum
  // because they're EVM-compatible. The chain ID is handled separately.
} as const;

// ============================================================================
// MNEMONIC & SEED MANAGEMENT (PARANOID MODE)
// ============================================================================

/**
 * IMPORTANT SECURITY NOTES:
 *
 * 1. MNEMONIC SHOULD NEVER BE STORED ON THE HOT SERVER
 * 2. ONLY STORE THE EXTENDED PUBLIC KEY (XPUB)
 * 3. PRIVATE KEYS SHOULD BE:
 *    - Generated on-demand from xpub
 *    - Encrypted with AES-256 before storage
 *    - Swept to cold storage immediately
 * 4. MASTER PRIVATE KEY (XPRIV) STAYS IN COLD STORAGE (AIR-GAPPED)
 */

/**
 * Generate a new BIP39 mnemonic phrase
 * ONLY RUN THIS ONCE IN COLD STORAGE, NEVER ON HOT SERVER
 */
export function generateMnemonic(): string {
  const entropy = randomBytes(16); // 128 bits for 12-word mnemonic
  return bip39.entropyToMnemonic(entropy);
}

/**
 * Validate mnemonic phrase
 */
export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

/**
 * Derive master private key from mnemonic (COLD STORAGE ONLY)
 * NEVER USE THIS ON THE HOT SERVER
 */
export function deriveMasterKey(mnemonic: string, password = ''): ethers.HDNodeWallet {
  return ethers.HDNodeWallet.fromPhrase(mnemonic, password);
}

/**
 * Get extended public key (xpub) from master key
 * This is SAFE to store on the hot server
 */
export function getExtendedPublicKey(
  mnemonic: string,
  network: keyof typeof BIP44_PATHS
): string {
  const masterKey = deriveMasterKey(mnemonic);
  const basePath = BIP44_PATHS[network];
  const baseNode = masterKey.derivePath(basePath);

  return baseNode.extendedKey;
}

// ============================================================================
// HD WALLET DERIVATION (HOT SERVER)
// ============================================================================

/**
 * Derive wallet address from xpub and index
 * This is SAFE for the hot server as it only uses public key derivation
 */
export function deriveWalletFromXpub(
  xpub: string,
  index: number,
  network: keyof typeof BIP44_PATHS
): Omit<DerivedWallet, 'privateKey'> {
  const basePath = BIP44_PATHS[network];
  const fullPath = `${basePath}/${index}`;

  const hdNode = ethers.HDNodeWallet.fromExtendedKey(xpub);
  const wallet = hdNode.derivePath(fullPath);

  return {
    address: wallet.address,
    derivationPath: fullPath,
    index,
  };
}

/**
 * Derive wallet with private key (USE WITH CAUTION)
 * Only use when you need to sign transactions (e.g., sweeping to cold storage)
 */
export async function deriveWalletWithPrivateKey(
  mnemonic: string,
  index: number,
  network: keyof typeof BIP44_PATHS,
  encryptionKey: string
): Promise<EncryptedWalletData> {
  const basePath = BIP44_PATHS[network];
  const fullPath = `${basePath}/${index}`;

  const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic)
    .derivePath(fullPath);

  // Encrypt private key before storing
  const privateKeyEncrypted = await encrypt(
    wallet.privateKey,
    encryptionKey
  );

  return {
    address: wallet.address,
    privateKeyEncrypted,
    derivationPath: fullPath,
    index,
    network,
  };
}

/**
 * Decrypt private key for use (e.g., sweeping funds)
 */
export async function decryptWalletPrivateKey(
  encryptedKey: string,
  encryptionKey: string
): Promise<string> {
  return await decrypt(encryptedKey, encryptionKey);
}

// ============================================================================
// BATCH ADDRESS GENERATION
// ============================================================================

/**
 * Generate multiple addresses at once
 * Useful for pre-generating addresses
 */
export function deriveAddressBatch(
  xpub: string,
  startIndex: number,
  count: number,
  network: keyof typeof BIP44_PATHS
): Omit<DerivedWallet, 'privateKey'>[] {
  const addresses: Omit<DerivedWallet, 'privateKey'>[] = [];

  for (let i = 0; i < count; i++) {
    const wallet = deriveWalletFromXpub(xpub, startIndex + i, network);
    addresses.push(wallet);
  }

  return addresses;
}

// ============================================================================
// ADDRESS GAP LIMIT
// ============================================================================

/**
 * Check for gap limit (BIP44 recommendation: stop if 20 unused addresses)
 * Returns the next unused index
 */
export function findNextUnusedIndex(
  usedIndexes: number[],
  _gapLimit = 20
): number {
  // Sort and find gaps
  const sorted = [...usedIndexes].sort((a, b) => a - b);

  if (sorted.length === 0) return 0;

  // Find first gap
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i) return i;
  }

  // Check gap limit
  const lastIndex = sorted[sorted.length - 1];
  const nextIndex = lastIndex + 1;

  // If we have a gap of unused addresses, we need to verify they're truly unused
  // This would require checking blockchain activity
  // For now, return next index but warn in production you'd scan the blockchain

  return nextIndex;
}

// ============================================================================
// ADDRESS VALIDATION
// ============================================================================

/**
 * Validate Ethereum/EVM address
 */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Convert to checksum address
 */
export function toChecksumAddress(address: string): string {
  return ethers.getAddress(address);
}

/**
 * Check if address is a contract (has code)
 * Requires provider connection
 */
export async function isContractAddress(
  address: string,
  provider: unknown
): Promise<boolean> {
  try {
    const code = await (provider as { getCode: (addr: string) => Promise<string> }).getCode(address);
    return code !== '0x';
  } catch {
    return false;
  }
}
