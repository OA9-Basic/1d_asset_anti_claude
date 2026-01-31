/**
 * Soft Delete Utility Functions
 *
 * Provides helper functions for implementing soft delete pattern
 * across the application. Soft delete marks records as deleted without
 * actually removing them from the database.
 *
 * Models with soft delete support:
 * - User (deletedAt field)
 * - Asset (deletedAt field)
 */

import { Prisma } from '@prisma/client';

import { db } from '@/lib/db';

/**
 * Soft delete scope - filters out deleted records
 * Add this to queries to exclude soft-deleted records
 */
export const softDeleteScope = {
  deletedAt: null,
};

/**
 * Include deleted records scope
 * Use this when you need to query both active and deleted records
 */
export const includeDeletedScope = {};

/**
 * Only deleted records scope
 * Use this when you only want to query soft-deleted records
 */
export const onlyDeletedScope = {
  deletedAt: { not: null as null },
};

/**
 * Check if a record is soft deleted
 */
export function isSoftDeleted<T extends { deletedAt: Date | null }>(record: T): boolean {
  return record.deletedAt !== null;
}

/**
 * Soft delete a User by ID
 * Sets deletedAt timestamp instead of actually deleting
 */
export async function softDeleteUser(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      isActive: false, // Also deactivate the user
    },
  });
}

/**
 * Restore a soft-deleted User
 */
export async function restoreUser(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      deletedAt: null,
      isActive: true,
    },
  });
}

/**
 * Permanently delete a User (use with extreme caution)
 * This will actually delete the record and cascade to related data
 */
export async function permanentDeleteUser(userId: string): Promise<void> {
  await db.user.delete({
    where: { id: userId },
  });
}

/**
 * Soft delete an Asset by ID
 */
export async function softDeleteAsset(assetId: string): Promise<void> {
  await db.asset.update({
    where: { id: assetId },
    data: {
      deletedAt: new Date(),
    },
  });
}

/**
 * Restore a soft-deleted Asset
 */
export async function restoreAsset(assetId: string): Promise<void> {
  await db.asset.update({
    where: { id: assetId },
    data: {
      deletedAt: null,
    },
  });
}

/**
 * Permanently delete an Asset (use with extreme caution)
 */
export async function permanentDeleteAsset(assetId: string): Promise<void> {
  await db.asset.delete({
    where: { id: assetId },
  });
}

/**
 * Prisma middleware to automatically filter soft-deleted records
 * This intercepts all queries and adds deletedAt: null filter
 */
export function createSoftDeleteMiddleware() {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      query: {
        $allOperations({ model, operation, args, query }) {
          // Only apply to find/findFirst/findMany operations
          // on models with soft delete support
          if (
            (model === 'User' || model === 'Asset') &&
            (operation === 'findUnique' ||
              operation === 'findFirst' ||
              operation === 'findMany' ||
              operation === 'count')
          ) {
            // Don't apply if the query explicitly includes deletedAt
            const hasDeletedAtFilter = args.where?.deletedAt !== undefined;

            if (!hasDeletedAtFilter) {
              // Add soft delete filter
              args.where = {
                ...args.where,
                deletedAt: null,
              };
            }
          }
          return query(args);
        },
      },
    });
  });
}

/**
 * Enhanced Prisma client with soft delete middleware
 * Use this instead of the default db client for automatic soft delete filtering
 *
 * @example
 * ```ts
 * import { dbWithSoftDelete } from '@/lib/soft-delete';
 *
 * // This will automatically exclude soft-deleted records
 * const users = await dbWithSoftDelete.user.findMany();
 *
 * // To include deleted records, use the default db client
 * import { db } from '@/lib/db';
 * const allUsers = await db.user.findMany();
 * ```
 */
export const dbWithSoftDelete = createSoftDeleteMiddleware()(db);

/**
 * Clean up old soft-deleted records
 * Run this periodically to permanently delete records that have been
 * soft deleted for longer than the specified retention period
 *
 * @param retentionDays - Number of days to retain soft-deleted records (default: 30)
 * @returns Object with counts of deleted records
 */
export async function cleanupOldSoftDeletes(retentionDays: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const [deletedUsers, deletedAssets] = await Promise.all([
    // Permanently delete users soft-deleted before cutoff date
    db.user.deleteMany({
      where: {
        deletedAt: {
          lte: cutoffDate,
        },
      },
    }),
    // Permanently delete assets soft-deleted before cutoff date
    db.asset.deleteMany({
      where: {
        deletedAt: {
          lte: cutoffDate,
        },
      },
    }),
  ]);

  return {
    usersDeleted: deletedUsers.count,
    assetsDeleted: deletedAssets.count,
    cutoffDate,
  };
}
