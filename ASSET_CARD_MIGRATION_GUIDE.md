# Modern Bento-Style Asset Card Component

## Overview

A completely redesigned Asset Card component with modern bento-style design, Framer Motion animations, and full backend connectivity. This component replaces the existing `src/components/features/asset-card.tsx` with a significantly enhanced UI/UX.

## Location

**New Component**: `src/components/dashboard/asset-card.tsx`

**Old Component**: `src/components/features/asset-card.tsx`

## Key Features

### 1. Modern Bento-Style Design

- Clean, rounded-xl corners (2xl) for a modern aesthetic
- Gradient backgrounds with subtle overlays
- Enhanced spacing and visual hierarchy
- Professional shadow effects with hover elevation

### 2. Enhanced Thumbnail Experience

- Large 64-height thumbnail (256px)
- Smooth hover zoom effect (scale-110)
- Gradient overlay on hover
- Fallback placeholder with icon when no image
- Image error handling with graceful degradation

### 3. Thick Gradient Progress Bar

- Animated gradient progress bar for COLLECTING status
- Shimmer effect animation
- Smooth width animation on mount
- Clear progress percentage display
- "X% Funded" with gradient text

### 4. Status Badges with Icons

- Status-specific color schemes and gradients
- Backdrop blur effect for modern glass morphism
- Icons for each status type:
  - REQUESTED: Clock icon, slate colors
  - APPROVED: CheckCircle2, blue gradient
  - COLLECTING: Clock, violet-purple gradient
  - PURCHASED: CheckCircle2, emerald gradient
  - AVAILABLE: ShoppingCart, green-emerald gradient
  - PAUSED: Clock, orange-red gradient
  - REJECTED: Clock, red-rose gradient

### 5. Pricing Information

- Clear target price display
- Current collected amount with gradient text
- Remaining amount to fund
- Price tag overlay for AVAILABLE status ($1)
- Grid layout for better information hierarchy

### 6. Hover Effects

- Scale 1.02 on hover (subtle lift)
- Y-axis lift (-4px) for elevation
- Enhanced shadow (shadow-2xl)
- Smooth transition (300ms ease)
- Text gradient effect on title hover

### 7. Framer Motion Animations

- **Container Animation**: Fade in + slide up
- **Card Animation**: Scale + fade in
- **Progress Bar**: Animated width with spring easing
- **Shimmer Effect**: Continuous horizontal animation
- **Button Hover**: Scale + tap feedback
- **Staggered Delays**: Elements animate in sequence

### 8. Status-Specific Styling

#### COLLECTING Status

- Shows progress bar with gradient
- "Contribute Now" button with violet-purple gradient
- Raised amount + Goal display
- Progress percentage
- Remaining amount message
- Violet-purple color scheme

#### AVAILABLE Status

- Shows "Instant Access" message
- "Get for $1" button with green-emerald gradient
- People count with access
- Green-emerald color scheme
- Price tag overlay ($1)

#### PURCHASED Status

- Shows "Fully Funded" message
- "View Asset" button
- People count display
- Emerald-teal color scheme

#### Other Statuses

- Disabled state with appropriate styling
- Status badge displayed
- No action button (disabled)

### 9. Full Backend Connectivity

#### Contribute API

- **Endpoint**: `POST /api/contribute`
- **Payload**: `{ assetId: string, amount: number }`
- **Features**:
  - Default $1 contribution from card
  - Loading state with spinner
  - Success toast notification
  - Error handling with toast
  - Redirect to asset page on success
  - Excess amount notification

#### Purchase API

- **Endpoint**: `POST /api/assets/[id]/purchase`
- **Payload**: `{ amount: number }`
- **Features**:
  - Fixed $1 purchase amount
  - Loading state with spinner
  - Success toast notification
  - Error handling with toast
  - Redirect with access=true on success

### 10. Progress Calculation

- Includes platform fee (15% by default)
- Calculates target with fee: `targetPrice * (1 + platformFee)`
- Shows accurate progress percentage
- Displays remaining amount to fund
- Handles edge cases (max 100%, min 0 remaining)

## TypeScript Interface

```typescript
interface AssetCardProps {
  asset: Asset & {
    _count?: {
      pledges: number;
    };
  };
}
```

## Usage Example

### Basic Usage

```typescript
import { AssetCard } from '@/components/dashboard/asset-card'
// or
import { AssetCard } from '@/components/dashboard'

// In your component
function MyPage() {
  const assets = [...] // Your asset data

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  )
}
```

### Migration from Old Component

**Before**:

```typescript
import { AssetCard } from '@/components/features/asset-card'

<AssetCard asset={asset} />
```

**After**:

```typescript
import { AssetCard } from '@/components/dashboard/asset-card'
// or
import { AssetCard } from '@/components/dashboard'

<AssetCard asset={asset} />
```

## Dependencies

The component uses the following dependencies (already installed in your project):

### UI Components

- `@/components/ui/card` - Card container
- `@/components/ui/badge` - Status badges
- `@/components/ui/button` - Action buttons
- `@/components/ui/progress` - Progress bar (custom implementation with gradient)

### Animation

- `framer-motion` - All animations and motion effects
  - Container animations
  - Card hover effects
  - Progress bar animations
  - Button interactions
  - Staggered delays

### Icons

- `lucide-react` - All icons used
  - Wallet, CheckCircle2, Clock
  - Users, ShoppingCart, Star
  - DollarSign, Sparkles, TrendingUp

### Utilities

- `@/hooks/use-toast` - Toast notifications
- `next/navigation` - Router for navigation
- `next/link` - Link wrapper for card

### Database

- `@prisma/client` - Asset type definition

## Component Structure

```tsx
<motion.div>
  {' '}
  // Container with fade-in animation
  <Link>
    {' '}
    // Clickable link to asset detail
    <motion.div>
      {' '}
      // Card with hover effects
      <Card>
        {' '}
        // Main card container
        {/* Thumbnail Section */}
        <div className="relative">
          <img /> {/* With hover zoom */}
          <Badge /> {/* Status badge */}
          <Badge /> {/* Featured badge */}
        </div>
        <CardContent>
          {/* Title & Type */}
          <h3>Title</h3>
          <Badge>Type</Badge>

          {/* Status-specific content */}
          {COLLECTING && <ProgressSection />}
          {AVAILABLE && <AccessSection />}
          {PURCHASED && <AccessSection />}

          {/* Stats */}
          <div>Users • Revenue</div>

          {/* Action Button */}
          <Button>Action</Button>
        </CardContent>
      </Card>
    </motion.div>
  </Link>
</motion.div>
```

## Color Schemes

### Primary Gradients

- **Violet-Purple**: `from-violet-500 to-purple-600` (COLLECTING)
- **Green-Emerald**: `from-green-500 to-emerald-600` (AVAILABLE)
- **Emerald-Teal**: `from-emerald-500 to-teal-600` (PURCHASED)
- **Blue-Cyan**: `from-blue-500 to-cyan-500` (APPROVED)

### Status Colors

- **Requested**: Slate (neutral)
- **Approved**: Blue (positive)
- **Collecting**: Violet-Purple (active)
- **Purchased**: Emerald (success)
- **Available**: Green-Emerald (ready)
- **Paused**: Orange-Red (warning)
- **Rejected**: Red-Rose (error)

## Responsive Design

The card is fully responsive and works with:

- Mobile: 1 column grid
- Tablet: 2 columns (sm:grid-cols-2)
- Desktop: 3 columns (lg:grid-cols-3)
- Large Desktop: 4 columns (xl:grid-cols-4)

## Accessibility Features

- Semantic HTML structure
- Proper ARIA labels through Radix UI components
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Alt text for images
- Meaningful link text

## Performance Optimizations

- Framer Motion animations use GPU acceleration
- Image lazy loading (native)
- Efficient re-renders with proper React patterns
- Minimal re-renders with isolated state
- Optimized animation timings

## Customization

### Modify Animation Speed

```typescript
// In cardVariants
transition: {
  duration: 0.3,  // Change this
  ease: [0.25, 0.4, 0.25, 1],
}
```

### Change Hover Scale

```typescript
// In whileHover
whileHover={{
  scale: 1.02,  // Change this (1.0 = no scale, 1.1 = large scale)
  y: -4,
}}
```

### Adjust Thumbnail Height

```typescript
// Currently h-64 (256px)
className = 'w-full h-64 object-cover';
// Change to h-56 (224px) or h-72 (288px)
```

### Modify Progress Bar Gradient

```typescript
// Currently: from-violet-500 via-purple-500 to-fuchsia-500
className = 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500';
```

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Future Enhancements

Potential improvements for future versions:

1. Wishlist/favorite functionality
2. Quick preview modal on hover
3. Social share buttons
4. Multi-language support
5. Dark mode optimizations (already good, can be enhanced)
6. Skeleton loading state
7. Infinite scroll integration
8. Filter/sort animations

## Testing

Recommended test cases:

1. Render with all asset statuses
2. Contribute button functionality
3. Purchase button functionality
4. Error handling (API failures)
5. Image loading and error states
6. Hover animations
7. Responsive layout
8. Accessibility (keyboard nav)
9. Toast notifications
10. Progress calculation accuracy

## Support

For issues or questions:

1. Check the API endpoints are working
2. Verify asset data structure
3. Check browser console for errors
4. Ensure all dependencies are installed
5. Test API responses manually

---

**Created**: 2026-01-23
**Component Version**: 2.0.0
**Status**: Production Ready
