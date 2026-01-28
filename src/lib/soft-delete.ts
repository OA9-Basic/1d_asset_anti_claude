/**
 * Soft Delete Utilities
 *
 * Provides helper functions for soft delete pattern.
 * Records are marked as deleted rather than actually removed from database.
 */

import { createLogger } from '@/lib/logger';

const logger = createLogger('soft-delete');

/**
 * Soft delete a user by ID
 */
export async function softDeleteUser(userId: string): Promise<void> {
  const { db } = await import('@/lib/db');

  await db.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });

  logger.info({ userId }, 'User soft deleted');
}

/**
 * Restore a soft deleted user
 */
export async function restoreUser(userId: string): Promise<void> {
  const { db } = await import('@/lib/db');

  await db.user.update({
    where: { id: userId },
    data: { deletedAt: null },
  });

  logger.info({ userId }, 'User restored');
}

/**
 * Soft delete an asset by ID
 */
export async function softDeleteAsset(assetId: string): Promise<void> {
  const { db } = await import('@/lib/db');

  await db.asset.update({
    where: { id: assetId },
    data: { deletedAt: new Date() },
  });

  logger.info({ assetId }, 'Asset soft deleted');
}

/**
 * Restore a soft deleted asset
 */
export async function restoreAsset(assetId: string): Promise<void> {
  const { db } = await import('@/lib/db');

  await db.asset.update({
    where: { id: assetId },
    data: { deletedAt: null },
  });

  logger.info({ assetId }, 'Asset restored');
}

/**
 * Check if a user is deleted
 */
export async function isUserDeleted(userId: string): Promise<boolean> {
  const { db } = await import('@/lib/db');

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { deletedAt: true },
  });

  return user?.deletedAt !== null;
}

/**
 * Check if an asset is deleted
 */
export async function isAssetDeleted(assetId: string): Promise<boolean> {
  const { db } = await import('@/lib/db');

  const asset = await db.asset.findUnique({
    where: { id: assetId },
    select: { deletedAt: true },
  });

  return asset?.deletedAt !== null;
}

/**
 * Prisma extension to automatically filter out soft-deleted records
 * Use this with Prisma client to exclude deleted records from queries
 *
 * Example:
 * const dbWithSoftDelete = prisma.$extends(withSoftDelete);
 * const users = await dbWithSoftDelete.user.findMany(); // Excludes deleted users
 */
export const withSoftDelete = {
  query: {
    $allOperations({ model, operation, args, query }: any) {
      // Only apply to findMany and findFirst operations on models with deletedAt
      if (
        (operation === 'findMany' || operation === 'findFirst') &&
        (model === 'User' || model === 'Asset')
      ) {
        // Add where clause to filter out deleted records
        args.where = args.where || {};
        args.where.deletedAt = null;
      }
      return query(args);
    },
  },
};
