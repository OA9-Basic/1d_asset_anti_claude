# Asset Card - Developer Quick Reference

## Import

```typescript
import { AssetCard } from '@/components/dashboard'
```

## Basic Usage

```typescript
<AssetCard asset={asset} />
```

## Props

```typescript
interface AssetCardProps {
  asset: Asset & {
    _count?: {
      pledges: number
    }
  }
}
```

## Status Types

- `REQUESTED` - Pending approval
- `APPROVED` - Approved, not yet funding
- `COLLECTING` - Accepting contributions
- `PURCHASED` - Purchased, being processed
- `AVAILABLE` - Available for purchase
- `PAUSED` - Temporarily paused
- `REJECTED` - Rejected

## Features by Status

| Status | Progress Bar | Button | Action |
|--------|-------------|--------|--------|
| REQUESTED | No | Disabled | View |
| APPROVED | No | Disabled | View |
| COLLECTING | Yes | Contribute | Navigate/Contribute |
| PURCHASED | No | View Asset | Navigate |
| AVAILABLE | No | Get for $1 | Purchase |
| PAUSED | No | Disabled | View |
| REJECTED | No | Disabled | View |

## API Calls

### Contribute
```typescript
// Automatic on button click
POST /api/contribute
{
  assetId: string,
  amount: 1
}
```

### Purchase
```typescript
// Automatic on button click
POST /api/assets/{id}/purchase
{
  amount: 1
}
```

## Progress Calculation

```typescript
platformFee = 0.15 (15%)
targetWithFee = targetPrice * (1 + platformFee)
progressPercent = (currentCollected / targetWithFee) * 100
remainingAmount = targetWithFee - currentCollected
```

## Styling

### Container
```typescript
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
```

### Card Dimensions
- Thumbnail: 256px tall (h-64)
- Border radius: 16px (rounded-2xl)
- Padding: 24px (p-6)
- Gap between items: 24px (gap-6)

## Colors

### COLLECTING
- Gradient: `from-violet-500 to-purple-600`
- Background: `from-violet-50 to-purple-50`

### AVAILABLE
- Gradient: `from-green-500 to-emerald-600`
- Background: `from-green-50 to-emerald-50`

### PURCHASED
- Gradient: `from-emerald-500 to-teal-600`
- Background: `from-emerald-50 to-teal-50`

## Animations

### Entrance
- Fade in: 400ms
- Slide up: 20px
- Stagger: Progressive delays

### Hover
- Scale: 1.02 (2% increase)
- Lift: -4px
- Duration: 200ms

### Progress Bar
- Width animation: 800ms
- Shimmer: 2s loop

## Toast Notifications

### Success
```typescript
toast({
  title: 'Contribution Successful!',
  description: 'You contributed $1 to {title}',
})
```

### Error
```typescript
toast({
  title: 'Contribution Failed',
  description: 'An error occurred',
  variant: 'destructive',
})
```

## Common Patterns

### Grid Layout
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {assets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
</div>
```

### With Loading
```typescript
<Suspense fallback={<AssetGridSkeleton />}>
  <AssetGrid />
</Suspense>
```

### Filter by Status
```typescript
const collectingAssets = assets.filter(a => a.status === 'COLLECTING')
```

## Troubleshooting

### Card not rendering
→ Check import path
→ Verify asset data structure
→ Check browser console

### Animations not working
→ Verify framer-motion installed
→ Check browser supports animations
→ Look for JS errors

### API calls failing
→ Check API routes running
→ Verify user authenticated
→ Check network tab

## File Locations

```
src/components/dashboard/
├── asset-card.tsx          ← Main component
├── index.ts                ← Export
└── __tests__/
    └── asset-card.test.tsx ← Tests
```

## Dependencies

- framer-motion
- lucide-react
- @/components/ui/*
- @/hooks/use-toast
- next/navigation

## Documentation

- `ASSET_CARD_MIGRATION_GUIDE.md` - Full technical docs
- `QUICK_START_GUIDE.md` - Fast integration
- `VISUAL_COMPARISON.md` - Before/after
- `README_ASSET_CARD.md` - Complete guide

## Version

- Current: 2.0.0
- Released: 2026-01-23
- Status: Production Ready

---

**Quick Copy-Paste Import:**

```typescript
import { AssetCard } from '@/components/dashboard'
```
