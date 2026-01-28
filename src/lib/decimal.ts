/**
 * Decimal Money Handling
 *
 * Provides safe decimal arithmetic for financial calculations.
 * Uses a string-based approach to avoid floating-point precision issues.
 *
 * NOTE: This is a lightweight implementation. For production, consider:
 * - decimal.js (https://github.com/MikeMcl/decimal.js)
 * - big.js (https://github.com/MikeMcl/big.js)
 * - Prisma.Decimal (built-in)
 */

/**
 * Safe addition for money amounts
 * Uses string manipulation to avoid floating-point errors
 */
export function add(a: number | string, b: number | string): string {
  const aStr = typeof a === 'number' ? a.toString() : a;
  const bStr = typeof b === 'number' ? b.toString() : b;

  // Parse to fixed-point with 2 decimal places for USD
  const aFixed = parseFloat(aStr).toFixed(2);
  const bFixed = parseFloat(bStr).toFixed(2);

  const sum = (parseFloat(aFixed) + parseFloat(bFixed)).toFixed(2);
  return sum;
}

/**
 * Safe subtraction for money amounts
 */
export function subtract(a: number | string, b: number | string): string {
  const aStr = typeof a === 'number' ? a.toString() : a;
  const bStr = typeof b === 'number' ? b.toString() : b;

  const aFixed = parseFloat(aStr).toFixed(2);
  const bFixed = parseFloat(bStr).toFixed(2);

  const diff = (parseFloat(aFixed) - parseFloat(bFixed)).toFixed(2);
  return diff;
}

/**
 * Safe multiplication for money amounts
 * Returns result with 2 decimal places
 */
export function multiply(a: number | string, b: number | string): string {
  const aStr = typeof a === 'number' ? a.toString() : a;
  const bStr = typeof b === 'number' ? b.toString() : b;

  const product = (parseFloat(aStr) * parseFloat(bStr)).toFixed(2);
  return product;
}

/**
 * Safe division for money amounts
 * Returns result with 2 decimal places
 */
export function divide(a: number | string, b: number | string): string {
  const aStr = typeof a === 'number' ? a.toString() : a;
  const bStr = typeof b === 'number' ? b.toString() : b;

  if (parseFloat(bStr) === 0) {
    throw new Error('Division by zero');
  }

  const quotient = (parseFloat(aStr) / parseFloat(bStr)).toFixed(2);
  return quotient;
}

/**
 * Calculate percentage
 */
export function percentage(amount: number | string, percent: number | string): string {
  return multiply(amount, divide(percent, 100));
}

/**
 * Format money for display
 */
export function formatMoney(amount: number | string, currency: string = 'USD'): string {
  const amountStr = typeof amount === 'number' ? amount.toString() : amount;
  const num = parseFloat(amountStr);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Parse string to number safely
 */
export function parseMoney(value: string): number {
  return parseFloat(parseFloat(value).toFixed(2));
}

/**
 * Compare two money amounts
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
export function compare(a: number | string, b: number | string): number {
  const aNum = parseFloat(typeof a === 'number' ? a.toString() : a);
  const bNum = parseFloat(typeof b === 'number' ? b.toString() : b);

  if (Math.abs(aNum - bNum) < 0.01) return 0; // Consider equal if within 1 cent
  return aNum < bNum ? -1 : 1;
}

/**
 * Check if amount is zero
 */
export function isZero(amount: number | string): boolean {
  const num = parseFloat(typeof amount === 'number' ? amount.toString() : amount);
  return Math.abs(num) < 0.01;
}

/**
 * Round to 2 decimal places (cents)
 */
export function round(amount: number | string): string {
  const num = parseFloat(typeof amount === 'number' ? amount.toString() : amount);
  return num.toFixed(2);
}

/**
 * Validate money amount
 */
export function isValidMoney(amount: number | string): boolean {
  const num = parseFloat(typeof amount === 'number' ? amount.toString() : amount);
  return !isNaN(num) && isFinite(num) && num >= 0;
}
