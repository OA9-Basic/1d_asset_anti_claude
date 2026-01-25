/**
 * Financial calculation utilities
 * SECURITY: Proper handling of monetary values to avoid floating point precision errors
 *
 * Uses integer cents internally to avoid floating point issues
 * All amounts are stored as cents (1/100 of currency unit)
 */

/**
 * Convert dollar amount to cents (integer)
 */
export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollar amount
 */
export function toDollars(cents: number): number {
  return cents / 100;
}

/**
 * Round to 2 decimal places (cents precision)
 * SECURITY FIX: Avoids floating point accumulation errors
 */
export function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Add two monetary amounts
 */
export function addMoney(a: number, b: number): number {
  return roundToCents(a + b);
}

/**
 * Subtract two monetary amounts
 */
export function subtractMoney(a: number, b: number): number {
  return roundToCents(a - b);
}

/**
 * Multiply monetary amount by a factor
 */
export function multiplyMoney(amount: number, factor: number): number {
  return roundToCents(amount * factor);
}

/**
 * Divide monetary amount by a factor
 */
export function divideMoney(amount: number, factor: number): number {
  return roundToCents(amount / factor);
}

/**
 * Calculate percentage of amount
 */
export function percentageOf(amount: number, percent: number): number {
  return roundToCents(amount * (percent / 100));
}

/**
 * Calculate proportion (for profit sharing)
 * Returns: amount * (numerator / denominator)
 */
export function proportionOf(amount: number, numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return roundToCents(amount * (numerator / denominator));
}

/**
 * Compare two monetary amounts for equality (with tolerance for floating point)
 */
export function moneyEquals(a: number, b: number, tolerance: number = 0.001): boolean {
  return Math.abs(a - b) < tolerance;
}

/**
 * Check if amount A is greater than amount B
 */
export function moneyGreaterThan(a: number, b: number): boolean {
  return a - b > 0.001;
}

/**
 * Check if amount A is less than amount B
 */
export function moneyLessThan(a: number, b: number): boolean {
  return b - a > 0.001;
}

/**
 * Format amount as currency string
 */
export function formatMoney(amount: number): string {
  return `$${roundToCents(amount).toFixed(2)}`;
}

/**
 * Validate monetary amount (must be non-negative)
 */
export function isValidMoney(amount: number): boolean {
  return typeof amount === 'number' && !isNaN(amount) && amount >= 0;
}

/**
 * Calculate remaining amount needed
 */
export function calculateRemaining(target: number, collected: number): number {
  return Math.max(0, roundToCents(target - collected));
}

/**
 * Calculate fee amount
 */
export function calculateFee(amount: number, feePercentage: number): number {
  return roundToCents(amount * feePercentage);
}

/**
 * Calculate amount after fee
 */
export function subtractFee(amount: number, feePercentage: number): number {
  const fee = calculateFee(amount, feePercentage);
  return subtractMoney(amount, fee);
}
