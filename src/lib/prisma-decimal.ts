/**
 * Prisma Decimal Utilities
 *
 * Helper functions to convert between Prisma Decimal and native JavaScript types
 */

import { Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';

/**
 * Convert Prisma Decimal to number
 * WARNING: This may lose precision for very large or very small numbers
 */
export function prismaDecimalToNumber(value: Prisma.Decimal | string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  // Prisma.Decimal
  return value.toNumber();
}

/**
 * Convert Prisma Decimal to string
 * Preserves full precision
 */
export function prismaDecimalToString(value: Prisma.Decimal | string | number | null | undefined): string {
  if (value === null || value === undefined) return '0';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  // Prisma.Decimal
  return value.toString();
}

/**
 * Convert number/string to Prisma Decimal
 */
export function toPrismaDecimal(value: number | string | Decimal | null | undefined): Prisma.Decimal {
  if (value === null || value === undefined) return new Prisma.Decimal(0);
  if (value instanceof Prisma.Decimal) return value;
  if (value instanceof Decimal) return new Prisma.Decimal(value.toString());
  return new Prisma.Decimal(value);
}

/**
 * Safe addition for Prisma Decimal fields
 */
export function addPrismaDecimals(a: Prisma.Decimal | string | number, b: Prisma.Decimal | string | number): Prisma.Decimal {
  const decimalA = a instanceof Prisma.Decimal ? a : new Prisma.Decimal(a);
  const decimalB = b instanceof Prisma.Decimal ? b : new Prisma.Decimal(b);
  return decimalA.add(decimalB);
}

/**
 * Safe subtraction for Prisma Decimal fields
 */
export function subtractPrismaDecimals(a: Prisma.Decimal | string | number, b: Prisma.Decimal | string | number): Prisma.Decimal {
  const decimalA = a instanceof Prisma.Decimal ? a : new Prisma.Decimal(a);
  const decimalB = b instanceof Prisma.Decimal ? b : new Prisma.Decimal(b);
  return decimalA.sub(decimalB);
}

/**
 * Safe multiplication for Prisma Decimal fields
 */
export function multiplyPrismaDecimals(a: Prisma.Decimal | string | number, b: Prisma.Decimal | string | number): Prisma.Decimal {
  const decimalA = a instanceof Prisma.Decimal ? a : new Prisma.Decimal(a);
  const decimalB = b instanceof Prisma.Decimal ? b : new Prisma.Decimal(b);
  return decimalA.mul(decimalB);
}

/**
 * Compare Prisma Decimal with number
 */
export function comparePrismaDecimalToNumber(value: Prisma.Decimal | string, compare: number, operator: '>' | '<' | '>=' | '<=' | '===' | '!=='): boolean {
  const decimal = value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
  const num = new Prisma.Decimal(compare);

  switch (operator) {
    case '>':
      return decimal.greaterThan(num);
    case '<':
      return decimal.lessThan(num);
    case '>=':
      return decimal.greaterThanOrEqualTo(num);
    case '<=':
      return decimal.lessThanOrEqualTo(num);
    case '===':
      return decimal.equals(num);
    case '!==':
      return !decimal.equals(num);
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}

/**
 * Check if Prisma Decimal is greater than a number
 */
export function isPrismaDecimalGreaterThan(value: Prisma.Decimal | string, compare: number): boolean {
  return comparePrismaDecimalToNumber(value, compare, '>');
}

/**
 * Check if Prisma Decimal is less than a number
 */
export function isPrismaDecimalLessThan(value: Prisma.Decimal | string, compare: number): boolean {
  return comparePrismaDecimalToNumber(value, compare, '<');
}

/**
 * Check if Prisma Decimal is greater than or equal to a number
 */
export function isPrismaDecimalGreaterThanOrEqual(value: Prisma.Decimal | string, compare: number): boolean {
  return comparePrismaDecimalToNumber(value, compare, '>=');
}

/**
 * Check if Prisma Decimal is less than or equal to a number
 */
export function isPrismaDecimalLessThanOrEqual(value: Prisma.Decimal | string, compare: number): boolean {
  return comparePrismaDecimalToNumber(value, compare, '<=');
}
