# App Layout System Documentation

Complete layout system with full frontend-backend connectivity for the Digital Asset Marketplace.

## Overview

The layout system provides two distinct layouts:

- **Protected App Layout** (`(app)`): For authenticated users with sidebar, header, and mobile navigation
- **Public Layout** (`(public)`): For marketing/public pages with transparent header and footer

## File Structure

```
src/
├── components/
│   └── layout/
│       ├── app-sidebar.tsx       # Collapsible sidebar with navigation
│       ├── app-header.tsx        # Header with breadcrumbs & wallet balance
│       ├── mobile-nav.tsx        # Bottom navigation for mobile
│       ├── main-nav.tsx          # Public navigation (existing)
│       └── header-wallet.tsx     # Wallet display component (existing)
├── app/
│   ├── (app)/
│   │   ├── layout.tsx            # Protected app layout wrapper
│   │   └── dashboard/            # Example protected page
│   └── (public)/
│       ├── layout.tsx            # Public layout wrapper
│       └── page.tsx              # Homepage (existing)
└── hooks/
    ├── use-auth.ts               # Authentication hook (existing)
    └── use-toast.ts              # Toast notifications hook (existing)
```

## Components

### 1. AppSidebar (`app-sidebar.tsx`)

**Features:**

- Collapsible sidebar with state management
- Navigation items with active route highlighting
- User profile section at bottom
- Framer Motion animations for smooth transitions
- Responsive design (auto-collapses on mobile)

**Navigation Routes:**

- Dashboard (`/dashboard`)
- Available Assets (`/marketplace/available`)
- Funding Assets (`/marketplace/funding`)
- My Assets (`/my-assets`)
- Wallet (`/wallet`)
- Create Asset (`/create`)
- Settings (`/settings`)

**Usage:**
Automatically included in `(app)/layout.tsx` - no manual import needed.

### 2. AppHeader (`app-header.tsx`)

**Features:**

- Dynamic breadcrumbs from current route
- Wallet balance display fetched from `/api/wallet/balance`
- User avatar with dropdown menu
- Mobile menu trigger
- Glassmorphism effect

**API Integration:**

- Fetches wallet balance on mount
- Sign out via `/api/auth/sign-out`
- Uses `useAuth()` hook for user data

**Usage:**
Automatically included in `(app)/layout.tsx` - no manual import needed.

### 3. MobileNav (`mobile-nav.tsx`)

**Features:**

- Bottom navigation bar for mobile devices
- 5 main items: Dashboard, Marketplace, My Assets, Wallet, Create
- Active state highlighting with motion animations
- Hidden on desktop (md+ breakpoint)
- iOS safe area support

**Usage:**
Automatically included in `(app)/layout.tsx` - no manual import needed.

### 4. Protected App Layout (`(app)/layout.tsx`)

**Features:**

- Authentication check using `useAuth()` hook
- Redirects to `/auth/sign-in` if not authenticated
- Includes sidebar, header, and main content area
- Responsive padding for sidebar
- Max-width container for content
- Loading state with gradient background

**Usage:**
Wrap any protected route by placing it in the `(app)` directory:

```typescript
// src/app/(app)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Your content */}
    </div>
  )
}
```

### 5. Public Layout (`(public)/layout.tsx`)

**Features:**

- Transparent/glassmorphism header using `MainNav`
- Full-width marketing layout
- Enhanced footer with social links
- No sidebar
- Toast notifications support

**Usage:**
Public pages go in the `(public)` directory:

```typescript
// src/app/(public)/page.tsx (homepage)
export default function HomePage() {
  return (
    <div>
      <h1>Welcome</h1>
      {/* Your marketing content */}
    </div>
  )
}
```

## API Integration

### Wallet Balance API

**Endpoint:** `GET /api/wallet/balance`

**Response:**

```typescript
{
  balance: number; // Total available balance
  withdrawableBalance: number; // Amount that can be withdrawn
  storeCredit: number; // Non-withdrawable credit
  totalDeposited: number; // Total lifetime deposits
  totalWithdrawn: number; // Total lifetime withdrawals
  totalContributed: number; // Total contributions made
  totalProfitReceived: number; // Total profit sharing received
}
```

**Usage in AppHeader:**

```typescript
const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);

useEffect(() => {
  async function fetchBalance() {
    const res = await fetch('/api/wallet/balance');
    if (res.ok) {
      const data = await res.json();
      setWalletBalance(data);
    }
  }
  fetchBalance();
}, [user]);
```

### Authentication API

**Session Check:** `GET /api/auth/session`
**Sign Out:** `POST /api/auth/sign-out`

Both are integrated into `useAuth()` hook.

## Routing Guide

### Protected Routes (Require Authentication)

Place these in `src/app/(app)/`:

```
(app)/
├── dashboard/
│   └── page.tsx
├── marketplace/
│   ├── available/
│   │   └── page.tsx
│   └── funding/
│       └── page.tsx
├── my-assets/
│   └── page.tsx
├── wallet/
│   └── page.tsx
├── create/
│   └── page.tsx
└── settings/
    └── page.tsx
```

**Example:**

```typescript
// src/app/(app)/marketplace/available/page.tsx
export default function AvailableAssetsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Available Assets</h1>
      {/* Content automatically wrapped by (app)/layout.tsx */}
    </div>
  )
}
```

### Public Routes (No Authentication Required)

Place these in `src/app/(public)/`:

```
(public)/
├── page.tsx              # Homepage
├── about/
│   └── page.tsx
├── contact/
│   └── page.tsx
└── terms/
    └── page.tsx
```

### Auth Routes (Separate)

Authentication pages have their own layout:

```
auth/
├── sign-in/
│   └── page.tsx
└── sign-up/
    └── page.tsx
```

## Styling & Theme

### Colors (Purple/Violet Theme)

```css
--primary: 262 83% 58%; /* Violet */
--gradient-from: 262 83% 58%; /* From violet */
--gradient-to: 276 77% 53%; /* To purple */
```

### Gradient Classes

```tsx
className = 'bg-gradient-to-r from-violet-500 to-purple-600';
className = 'bg-gradient-to-br from-violet-500/10 to-purple-600/10';
```

### Glassmorphism Effect

```tsx
className = 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60';
```

## Mobile Responsiveness

### Breakpoints

- Mobile: < 768px (sidebar hidden, bottom nav visible)
- Desktop: >= 768px (sidebar visible, bottom nav hidden)

### Safe Area Support (iOS)

Added to `globals.css`:

```css
.h-safe-area-bottom {
  height: env(safe-area-inset-bottom);
}

.pb-safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

## State Management

### Auth State

```typescript
const { user, isLoading } = useAuth();
```

- `user`: User object or null
- `isLoading`: Boolean for loading state

### Toast Notifications

```typescript
const { toast } = useToast();

toast({
  title: 'Success',
  description: 'Action completed successfully',
});
```

### Sidebar State

Managed internally in `AppSidebar` component with localStorage persistence (can be added).

## Animation Library

All animations use **Framer Motion**:

```bash
npm install framer-motion
```

**Example:**

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>;
```

## TypeScript Interfaces

```typescript
// User
interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string;
}

// Wallet Balance
interface WalletBalance {
  balance: number;
  withdrawableBalance: number;
  storeCredit: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalContributed: number;
  totalProfitReceived: number;
}
```

## Migration Guide

### Existing Pages to Protected Layout

1. Move page from `src/app/` to `src/app/(app)/`
2. Remove any existing layout components (sidebar, header)
3. The `(app)/layout.tsx` will automatically wrap your content

**Example:**

```bash
# Before
src/app/dashboard/page.tsx

# After
src/app/(app)/dashboard/page.tsx
```

### Public Pages

1. Move page from `src/app/` to `src/app/(public)/`
2. Keep marketing-focused content

## Best Practices

1. **Always use `useAuth()`** in protected pages to ensure user is authenticated
2. **Check loading states** before rendering user-specific content
3. **Handle errors** gracefully with toast notifications
4. **Use proper TypeScript types** for API responses
5. **Keep navigation items** in sync with actual route structure
6. **Test responsive design** on multiple screen sizes
7. **Use semantic HTML** with proper ARIA labels
8. **Optimize images** and lazy load when possible

## Troubleshooting

### Sidebar not showing on desktop

- Check that file is in `(app)` directory
- Verify `useAuth()` is returning a user
- Check browser console for errors

### Wallet balance not loading

- Verify `/api/wallet/balance` endpoint is working
- Check user has a wallet record in database
- Check browser network tab for API errors

### Mobile nav not showing

- Ensure viewport meta tag is set
- Check CSS z-index conflicts
- Verify file is in `(app)` directory

### Routes not protected

- Ensure file is in `(app)` directory, not `(public)`
- Check that `useAuth()` redirect is working
- Verify user is actually authenticated

## Dependencies

All dependencies are already installed:

```json
{
  "framer-motion": "^12.29.0",
  "lucide-react": "^0.460.0",
  "@radix-ui/react-avatar": "^1.1.11",
  "@radix-ui/react-dropdown-menu": "^2.1.16",
  "next": "14.2.18",
  "react": "^18.3.1"
}
```

## Future Enhancements

Potential improvements:

1. Add localStorage persistence for sidebar collapsed state
2. Add keyboard shortcuts for navigation
3. Add search functionality in sidebar
4. Add notification badges to navigation items
5. Add theme toggle (dark/light mode)
6. Add user preferences for sidebar behavior
7. Add animation preferences (reduce motion)
8. Add more breadcrumb customization options

---

**Created:** 2025-01-23
**Version:** 1.0.0
**Status:** Production Ready
