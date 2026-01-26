/**
 * ENCRYPTION UTILITIES
 * AES-256 encryption for private keys and sensitive data
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHash } from 'crypto';

// ============================================================================
// CONFIGURATION
// ============================================================================

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;

// ============================================================================
// TYPES
// ============================================================================

export interface EncryptedData {
  encrypted: string;
  iv: string;
  salt: string;
  tag: string;
}

// ============================================================================
// ENCRYPTION FUNCTIONS
// ============================================================================

/**
 * Derive encryption key from password using scrypt
 * Memory-hard KDF to prevent brute force attacks
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return scryptSync(
    password,
    salt,
    {
      N: 2 ** 16, // Cost factor (CPU/memory cost)
      r: 8,       // Block size
      p: 1,       // Parallelization
      keylen: KEY_LENGTH,
    }
  );
}

/**
 * Encrypt data using AES-256-GCM
 * @param data - Data to encrypt (will be converted to string)
 * @param password - Encryption password (use strong password from env)
 * @returns Encrypted data with IV, salt, and auth tag
 */
export async function encrypt(
  data: string,
  password: string
): Promise<string> {
  // Generate random salt and IV
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);

  // Derive key from password
  const key = deriveKey(password, salt);

  // Create cipher
  const cipher = createCipheriv(ALGORITHM, key, iv);

  // Encrypt data
  const plaintext = Buffer.from(data, 'utf8');
  const encrypted = Buffer.concat([
    cipher.update(plaintext),
    cipher.final(),
  ]);

  // Get authentication tag
  const tag = cipher.getAuthTag();

  // Combine: salt + iv + tag + encrypted
  const combined = Buffer.concat([
    salt,
    iv,
    tag,
    encrypted,
  ]);

  // Return as hex string
  return combined.toString('hex');
}

/**
 * Decrypt data using AES-256-GCM
 * @param encryptedHex - Hex string containing salt + iv + tag + encrypted data
 * @param password - Decryption password (must match encryption password)
 * @returns Decrypted original data
 * @throws Error if decryption fails (wrong password or corrupted data)
 */
export async function decrypt(
  encryptedHex: string,
  password: string
): Promise<string> {
  try {
    // Parse combined data
    const combined = Buffer.from(encryptedHex, 'hex');

    if (combined.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH) {
      throw new Error('Invalid encrypted data');
    }

    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Derive key from password
    const key = deriveKey(password, salt);

    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, key, iv);

    // Set authentication tag
    decipher.setAuthTag(tag);

    // Decrypt data
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch {
    throw new Error('Decryption failed: Invalid password or corrupted data');
  }
}

/**
 * Encrypt private key specifically
 * Wrapper with additional safety checks
 */
export async function encryptPrivateKey(
  privateKey: string,
  password: string
): Promise<string> {
  // Validate private key format
  if (!privateKey.match(/^0x[a-fA-F0-9]{64}$/)) {
    throw new Error('Invalid private key format');
  }

  return await encrypt(privateKey, password);
}

/**
 * Decrypt private key specifically
 * Wrapper with additional validation
 */
export async function decryptPrivateKey(
  encryptedKey: string,
  password: string
): Promise<string> {
  const decrypted = await decrypt(encryptedKey, password);

  // Validate decrypted private key
  if (!decrypted.match(/^0x[a-fA-F0-9]{64}$/)) {
    throw new Error('Decrypted data is not a valid private key');
  }

  return decrypted;
}

/**
 * Generate a random encryption key
 * Useful for one-time encryption keys
 */
export function generateEncryptionKey(): string {
  return randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Hash sensitive data for comparison (one-way)
 * Useful for storing passwords or verification codes
 */
export function hashData(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Verify data against hash
 */
export function verifyHash(data: string, hash: string): boolean {
  return hashData(data) === hash;
}
