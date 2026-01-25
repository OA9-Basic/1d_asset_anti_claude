# Quick Start Guide: Modern Asset Card

## 1. Overview

This guide helps you quickly integrate the new modern bento-style Asset Card component into your application.

## 2. File Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── asset-card.tsx       ← NEW: Modern component
│   │   └── index.ts             ← Barrel export
│   └── features/
│       └── asset-card.tsx       ← OLD: Can be deprecated
```

## 3. Installation Checklist

All dependencies are already installed in your project:

- [x] framer-motion@12.29.0
- [x] lucide-react@0.460.0
- [x] @/components/ui/card
- [x] @/components/ui/badge
- [x] @/components/ui/button
- [x] @/components/ui/progress
- [x] @/hooks/use-toast
- [x] next/navigation

## 4. Import Options

### Option A: Direct Import

```typescript
import { AssetCard } from '@/components/dashboard/asset-card';
```

### Option B: Barrel Export (Recommended)

```typescript
import { AssetCard } from '@/components/dashboard';
```

## 5. Basic Usage

```typescript
import { AssetCard } from '@/components/dashboard'

function MyPage() {
  const assets = [
    {
      id: '1',
      title: 'Example Asset',
      status: 'COLLECTING',
      // ... other asset properties
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  )
}
```

## 6. Migration Steps

### Step 1: Update Imports (1 minute)

Find all files using the old component:

```bash
grep -r "features/asset-card" src/
```

Replace the import:

**Before:**

```typescript
import { AssetCard } from '@/components/features/asset-card';
```

**After:**

```typescript
import { AssetCard } from '@/components/dashboard';
```

### Step 2: Test (2 minutes)

1. Start dev server: `npm run dev`
2. Navigate to pages using AssetCard
3. Verify rendering
4. Test interactions

### Step 3: Deploy

No database changes or API changes required! The component is fully backward compatible.

## 7. Features Verification

After migration, verify these features work:

### Visual Features

- [ ] Cards have rounded-2xl corners
- [ ] Thumbnail has hover zoom effect
- [ ] Progress bar shows gradient animation
- [ ] Status badges have icons
- [ ] Hover effects work (scale + lift)
- [ ] Entrance animations play on page load

### Functional Features

- [ ] Contribute button works (COLLECTING status)
- [ ] Purchase button works (AVAILABLE status)
- [ ] View Asset button works (PURCHASED status)
- [ ] Toast notifications appear
- [ ] Loading states show during API calls
- [ ] Error handling works correctly

### API Integration

- [ ] POST /api/contribute works
- [ ] POST /api/assets/[id]/purchase works
- [ ] Success toasts show correct messages
- [ ] Error toasts show error details
- [ ] Redirects work after success

## 8. Troubleshooting

### Issue: Cards not rendering

**Solution:**

1. Check console for errors
2. Verify import path is correct
3. Ensure asset data has required fields

### Issue: Animations not working

**Solution:**

1. Verify framer-motion is installed
2. Check browser supports CSS animations
3. Look for JavaScript errors in console

### Issue: API calls failing

**Solution:**

1. Check API routes are running
2. Verify user is authenticated
3. Check network tab in browser DevTools
4. Verify API endpoints match code

### Issue: Images not loading

**Solution:**

1. Check image URLs are valid
2. Verify CORS settings for external images
3. Component shows fallback placeholder on error

## 9. Customization Examples

### Change Grid Layout

```typescript
// Mobile: 1 column
// Tablet: 2 columns
// Desktop: 3 columns
// Large: 4 columns

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {assets.map((asset) => (
    <AssetCard key={asset.id} asset={asset} />
  ))}
</div>
```

### Filter by Status

```typescript
// Show only COLLECTING assets
const collectingAssets = assets.filter((a) => a.status === 'COLLECTING');

// Show only AVAILABLE assets
const availableAssets = assets.filter((a) => a.status === 'AVAILABLE');
```

### Add Sorting

```typescript
// Sort by most recent
const sortedAssets = [...assets].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

// Sort by most funded
const byFunded = [...assets].sort((a, b) => b.currentCollected - a.currentCollected);
```

## 10. Performance Tips

### 1. Use Server Components Where Possible

```typescript
// This is a Server Component (good for performance)
async function AssetGrid() {
  const assets = await db.asset.findMany()
  return <div>{assets.map(a => <AssetCard key={a.id} asset={a} />)}</div>
}
```

### 2. Add Loading States

```typescript
<Suspense fallback={<AssetGridSkeleton />}>
  <AssetGrid />
</Suspense>
```

### 3. Pagination for Large Lists

```typescript
// Instead of loading all assets
const assets = await db.asset.findMany({ take: 50 });

// Use pagination
const assets = await db.asset.findMany({
  take: 12,
  skip: (page - 1) * 12,
});
```

## 11. Next Steps

1. ✅ Review the component code
2. ✅ Update imports in your pages
3. ✅ Test all functionality
4. ✅ Deploy to staging environment
5. ✅ Monitor for issues
6. ✅ Roll out to production

## 12. Resources

- **Full Documentation**: `ASSET_CARD_MIGRATION_GUIDE.md`
- **Migration Example**: `MIGRATION_EXAMPLE.tsx`
- **Component Source**: `src/components/dashboard/asset-card.tsx`
- **API Endpoints**:
  - Contribute: `src/app/api/contribute/route.ts`
  - Purchase: `src/app/api/assets/[id]/purchase/route.ts`

## 13. Support

If you encounter issues:

1. Check the browser console for errors
2. Review the API response in Network tab
3. Verify asset data structure matches schema
4. Test API endpoints directly
5. Check the migration guide for troubleshooting

---

**Component Version**: 2.0.0
**Last Updated**: 2026-01-23
**Status**: Production Ready ✅
