/**
 * Decimal Money Handling
 *
 * Provides safe decimal arithmetic for financial calculations using decimal.js.
 * This ensures precise decimal arithmetic without floating-point precision issues.
 */

import Decimal from 'decimal.js';

// Configure Decimal for monetary calculations (2 decimal places for USD)
Decimal.set({
  precision: 28, // Total significant digits
  rounding: Decimal.ROUND_HALF_UP, // Standard rounding
  toExpNeg: -7, // Exponential notation threshold
  toExpPos: 21,
  maxE: 9e15,
  minE: -9e15,
  modulo: Decimal.ROUND_DOWN,
});

/**
 * Convert value to Decimal instance
 */
function toDecimal(value: number | string | Decimal): Decimal {
  return new Decimal(value);
}

/**
 * Convert Decimal to Prisma Decimal
 */
export function toPrismaDecimal(value: number | string | Decimal): string {
  return toDecimal(value).toFixed(2);
}

/**
 * Safe addition for money amounts
 */
export function add(a: number | string, b: number | string): string {
  const result = toDecimal(a).plus(toDecimal(b));
  return result.toFixed(2);
}

/**
 * Safe subtraction for money amounts
 */
export function subtract(a: number | string, b: number | string): string {
  const result = toDecimal(a).minus(toDecimal(b));
  return result.toFixed(2);
}

/**
 * Safe multiplication for money amounts
 */
export function multiply(a: number | string, b: number | string): string {
  const result = toDecimal(a).times(toDecimal(b));
  return result.toFixed(2);
}

/**
 * Safe division for money amounts
 */
export function divide(a: number | string, b: number | string): string {
  const denominator = toDecimal(b);

  if (denominator.isZero()) {
    throw new Error('Division by zero');
  }

  const result = toDecimal(a).dividedBy(denominator);
  return result.toFixed(2);
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
  const num = toDecimal(amount).toNumber();

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
export function parseMoney(value: string | number): number {
  return toDecimal(value).toNumber();
}

/**
 * Compare two money amounts
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
export function compare(a: number | string, b: number | string): number {
  const cmp = toDecimal(a).comparedTo(toDecimal(b));

  if (cmp < 0) return -1;
  if (cmp > 0) return 1;
  return 0;
}

/**
 * Check if amount is zero
 */
export function isZero(amount: number | string): boolean {
  return toDecimal(amount).isZero();
}

/**
 * Round to 2 decimal places (cents)
 */
export function round(amount: number | string): string {
  return toDecimal(amount).toFixed(2);
}

/**
 * Validate money amount
 */
export function isValidMoney(amount: number | string): boolean {
  try {
    const decimal = toDecimal(amount);
    return decimal.isFinite() && decimal.greaterThanOrEqualTo(0);
  } catch {
    return false;
  }
}

/**
 * Check if amount is greater than another
 */
export function isGreaterThan(a: number | string, b: number | string): boolean {
  return toDecimal(a).greaterThan(toDecimal(b));
}

/**
 * Check if amount is less than another
 */
export function isLessThan(a: number | string, b: number | string): boolean {
  return toDecimal(a).lessThan(toDecimal(b));
}

/**
 * Get the minimum of two amounts
 */
export function min(a: number | string, b: number | string): string {
  return Decimal.min(toDecimal(a), toDecimal(b)).toFixed(2);
}

/**
 * Get the maximum of two amounts
 */
export function max(a: number | string, b: number | string): string {
  return Decimal.max(toDecimal(a), toDecimal(b)).toFixed(2);
}

/**
 * Export Decimal class for advanced usage
 */
export { Decimal };

