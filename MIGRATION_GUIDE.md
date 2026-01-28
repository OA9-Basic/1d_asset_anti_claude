# Database Migration Guide: SQLite to PostgreSQL

## Overview
This guide covers migrating from SQLite to PostgreSQL for production deployment.

## Prerequisites

- PostgreSQL 14+ installed locally or access to managed PostgreSQL (e.g., Supabase, Railway, Neon)
- Node.js and npm installed
- Existing `.env` file configured

---

## Step 1: Set Up PostgreSQL Database

### Option A: Local PostgreSQL (Development)

```bash
# Install PostgreSQL (Windows)
# Download from: https://www.postgresql.org/download/windows/

# Create database
psql -U postgres
CREATE DATABASE digital_assets_marketplace;
CREATE USER digital_assets_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE digital_assets_marketplace TO digital_assets_user;
\q
```

### Option B: Managed PostgreSQL (Production)

**Recommended Providers:**
- **Supabase** (Free tier available): https://supabase.com
- **Neon** (Serverless, Free tier): https://neon.tech
- **Railway** (Simple setup): https://railway.app
- **AWS RDS** (Enterprise): https://aws.amazon.com/rds/

**Example for Supabase:**
1. Create new project
2. Get connection string from Settings > Database
3. Format: `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`

---

## Step 2: Update Environment Variables

**File:** `.env`

```bash
# OLD (SQLite)
DATABASE_URL="file:./dev.db"

# NEW (PostgreSQL)
DATABASE_URL="postgresql://digital_assets_user:your_secure_password@localhost:5432/digital_assets_marketplace?schema=public"

# For Production (Supabase Example):
# DATABASE_URL="postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"
```

**For Production with Connection Pooling (Recommended):**
```bash
# Direct connection (for migrations)
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Pooled connection (for application - uses pgBouncer)
DATABASE_URL_POOLED="postgresql://user:pass@host:6543/dbname?pgbouncer=true"
```

---

## Step 3: Install PostgreSQL Prisma Client

```bash
# Install pg (PostgreSQL client for Node.js)
npm install pg@^8.11.0 --save

# Or if using pnpm
pnpm add pg@^8.11.0

# Or if using yarn
yarn add pg@^8.11.0
```

---

## Step 4: Generate Prisma Client for PostgreSQL

```bash
# Regenerate Prisma Client with new schema
npx prisma generate

# This will generate PostgreSQL-specific client code
```

---

## Step 5: Create Database Schema

```bash
# Create initial migration
npx prisma migrate dev --name init_postgresql

# OR if you want to reset the database (WARNING: deletes all data)
npx prisma migrate reset

# For production (create migration without running it)
npx prisma migrate dev --create-only --name init_postgresql
npx prisma migrate deploy
```

**Expected Output:**
```
✔ Generated Prisma Client
✔ The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20240129000000_init_postgresql/
    └─ migration.sql

Applying migration `20240129000000_init_postgresql`
```

---

## Step 6: Seed Database (Optional)

If you have seed data, create `prisma/seed-postgresql.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: '$2a$10$placeholder', // Replace with actual hash
      role: 'ADMIN',
      emailVerified: true,
      wallet: {
        create: {
          balance: 0,
          withdrawableBalance: 0,
          storeCredit: 0,
        },
      },
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run seed:**
```bash
npx prisma db seed
```

---

## Step 7: Verify Migration

```bash
# Test database connection
npx prisma studio

# This will open Prisma Studio at http://localhost:5555
# Verify all tables are created correctly
```

**Expected Tables:**
- User, Wallet, Transaction
- Asset, AssetRequest, Contribution
- AssetPurchase, ProfitShare, ProfitDistribution
- DepositOrder, HDWalletConfig, WalletAddress
- WebhookLog, NetworkConfig, AuditLog
- Vote, WithdrawalRequest, GapLoan

---

## Step 8: Update Docker Configuration (if using Docker)

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: digital_assets_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: digital_assets_user
      POSTGRES_PASSWORD: your_secure_password
      POSTGRES_DB: digital_assets_marketplace
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U digital_assets_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: "postgresql://digital_assets_user:your_secure_password@postgres:5432/digital_assets_marketplace"

volumes:
  postgres_data:
```

**Start Docker containers:**
```bash
docker-compose up -d
```

---

## Step 9: Production Deployment Checklist

### Pre-Deployment

- [ ] PostgreSQL database created
- [ ] Environment variables updated
- [ ] Migration tested in staging
- [ ] Database backup strategy configured
- [ ] Connection pooling enabled (if using managed service)
- [ ] SSL/TLS enabled for database connections

### Deployment

- [ ] Run `npx prisma migrate deploy`
- [ ] Verify schema: `npx prisma studio` (locally) or query pg_tables
- [ ] Test database connection
- [ ] Monitor for any connection issues

### Post-Deployment

- [ ] Monitor database performance
- [ ] Set up alerts for connection limits
- [ ] Configure automated backups
- [ ] Review slow query logs

---

## Common Issues & Solutions

### Issue 1: Connection Timeout

**Error:** `Connection terminated unexpectedly`

**Solution:**
```bash
# Add connection pool settings to DATABASE_URL
DATABASE_URL="postgresql://user:pass@host:5432/dbname?connection_limit=10&pool_timeout=20"
```

### Issue 2: Migration Conflicts

**Error:** `Migration failed: relation already exists`

**Solution:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset --force

# Or create new migration from baseline
npx prisma migrate resolve --applied "init_postgresql"
```

### Issue 3: Decimal Precision

**Note:** PostgreSQL `Decimal` uses `NUMERIC` type (better precision than SQLite)

**Prisma handles conversion automatically**, but verify in production:
```typescript
const balance = await db.wallet.findUnique({
  where: { id: walletId },
  select: { balance: true },
});

// balance is Decimal type - use prismaDecimalToNumber() helper
```

---

## Performance Optimization

### Indexes Already in Schema ✅

The schema includes comprehensive indexes:
- Foreign key indexes
- Status/type indexes
- Composite indexes for common queries
- Soft delete support

### Connection Pooling (Recommended for Production)

**For Supabase/Neon:**
```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL,
    },
  },
});

export { prisma as db };
```

### Query Optimization

```typescript
// Use select to limit returned fields
const user = await db.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    role: true,
    // Exclude large fields unless needed
  },
});

// Use take/skip for pagination
const assets = await db.asset.findMany({
  take: 20,
  skip: page * 20,
  orderBy: { createdAt: 'desc' },
});
```

---

## Monitoring & Maintenance

### Daily Checks

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries (requires pg_stat_statements extension)
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Weekly Maintenance

```sql
-- Vacuum and analyze tables
VACUUM ANALYZE;

-- Check for bloat
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total
FROM pg_tables
WHERE schemaname = 'public';
```

### Backup Strategy

**Manual Backup:**
```bash
pg_dump -U digital_assets_user -h localhost -p 5432 digital_assets_marketplace > backup.sql
```

**Automated Backup (cron):**
```bash
# Add to crontab (runs daily at 2 AM)
0 2 * * * pg_dump -U user -h host dbname > /backups/db_$(date +\%Y\%m\%d).sql
```

---

## Rollback Procedure

If issues occur, rollback to SQLite:

```bash
# 1. Update prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

# 2. Update .env
DATABASE_URL="file:./dev.db"

# 3. Regenerate client
npx prisma generate

# 4. Restore from backup (if available)
```

---

## Support & Resources

- **Prisma PostgreSQL Guide:** https://www.prisma.io/docs/concepts/database-connectors/postgresql
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Supabase Docs:** https://supabase.com/docs
- **Neon Docs:** https://neon.tech/docs

---

## Quick Reference Commands

```bash
# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Generate client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Check migration status
npx prisma migrate status
```

---

**Migration Status:** ✅ Schema updated to PostgreSQL
**Next Steps:** Follow deployment checklist above
