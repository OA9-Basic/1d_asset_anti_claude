/**
 * ASSET CARD COMPONENT TEST SUITE
 *
 * This file provides test cases and examples for verifying the Asset Card component.
 * Use this for manual testing or as a reference for automated tests.
 */

/* eslint-disable */
import { render, screen } from '@testing-library/react';

import { AssetCard } from '../asset-card';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockAssetCollecting = {
  id: 'test-asset-1',
  title: 'Complete Web Development Bootcamp 2026',
  description: 'Learn full-stack web development',
  type: 'COURSE',
  deliveryType: 'STREAM',
  targetPrice: 1000,
  platformFee: 0.15,
  currentCollected: 650,
  status: 'COLLECTING',
  totalPurchases: 0,
  totalPledges: 25,
  totalRevenue: 0,
  thumbnail: 'https://example.com/image.jpg',
  featured: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-23'),
  slug: 'complete-web-development-bootcamp',
};

const mockAssetAvailable = {
  id: 'test-asset-2',
  title: 'Premium UI Component Library',
  description: '500+ React components',
  type: 'SOFTWARE',
  deliveryType: 'DOWNLOAD',
  targetPrice: 500,
  platformFee: 0.15,
  currentCollected: 575, // Funded
  status: 'AVAILABLE',
  totalPurchases: 150,
  totalPledges: 45,
  totalRevenue: 150,
  thumbnail: null, // No image
  featured: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-23'),
  slug: 'premium-ui-component-library',
};

const mockAssetPurchased = {
  id: 'test-asset-3',
  title: 'AI Model Training Course',
  description: 'Master machine learning',
  type: 'COURSE',
  deliveryType: 'HYBRID',
  targetPrice: 2000,
  platformFee: 0.15,
  currentCollected: 2300,
  status: 'PURCHASED',
  totalPurchases: 200,
  totalPledges: 80,
  totalRevenue: 200,
  thumbnail: 'https://example.com/ai-course.jpg',
  featured: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-23'),
  slug: 'ai-model-training-course',
};

const mockAssetRequested = {
  id: 'test-asset-4',
  title: 'Requested Asset',
  description: 'Not yet approved',
  type: 'COURSE',
  deliveryType: 'STREAM',
  targetPrice: 100,
  platformFee: 0.15,
  currentCollected: 0,
  status: 'REQUESTED',
  totalPurchases: 0,
  totalPledges: 0,
  totalRevenue: 0,
  thumbnail: null,
  featured: false,
  createdAt: new Date('2026-01-23'),
  updatedAt: new Date('2026-01-23'),
  slug: 'requested-asset',
};

// ============================================================================
// TEST CASES
// ============================================================================

describe('AssetCard Component', () => {
  // Test 1: Renders with COLLECTING status
  test('renders COLLECTING asset correctly', () => {
    render(<AssetCard asset={mockAssetCollecting} />);

    // Check title
    expect(screen.getByText('Complete Web Development Bootcamp 2026')).toBeInTheDocument();

    // Check status badge
    expect(screen.getByText('Funding')).toBeInTheDocument();

    // Check progress
    expect(screen.getByText(/\$650/)).toBeInTheDocument();
    expect(screen.getByText(/\$1150/)).toBeInTheDocument(); // 1000 * 1.15

    // Check button
    expect(screen.getByText('Contribute Now')).toBeInTheDocument();
  });

  // Test 2: Renders with AVAILABLE status
  test('renders AVAILABLE asset correctly', () => {
    render(<AssetCard asset={mockAssetAvailable} />);

    expect(screen.getByText('Premium UI Component Library')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Instant Access')).toBeInTheDocument();
    expect(screen.getByText('Get for $1')).toBeInTheDocument();
    expect(screen.getByText(/150 people have access/)).toBeInTheDocument();
  });

  // Test 3: Renders with PURCHASED status
  test('renders PURCHASED asset correctly', () => {
    render(<AssetCard asset={mockAssetPurchased} />);

    expect(screen.getByText('AI Model Training Course')).toBeInTheDocument();
    expect(screen.getByText('Purchased')).toBeInTheDocument();
    expect(screen.getByText('Fully Funded')).toBeInTheDocument();
    expect(screen.getByText('View Asset')).toBeInTheDocument();
  });

  // Test 4: Renders with REQUESTED status
  test('renders REQUESTED asset correctly', () => {
    render(<AssetCard asset={mockAssetRequested} />);

    expect(screen.getByText('Requested Asset')).toBeInTheDocument();
    expect(screen.getByText('Requested')).toBeInTheDocument();
  });

  // Test 5: Shows featured badge
  test('shows featured badge when asset is featured', () => {
    render(<AssetCard asset={mockAssetCollecting} />);

    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  // Test 6: Does not show featured badge when not featured
  test('does not show featured badge when asset is not featured', () => {
    render(<AssetCard asset={mockAssetAvailable} />);

    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  // Test 7: Shows placeholder when no thumbnail
  test('shows placeholder when no thumbnail', () => {
    render(<AssetCard asset={mockAssetAvailable} />);

    expect(screen.getByText('No preview available')).toBeInTheDocument();
  });

  // Test 8: Progress calculation with platform fee
  test('calculates progress correctly with platform fee', () => {
    render(<AssetCard asset={mockAssetCollecting} />);

    // Target: 1000, Platform fee: 15%, Total: 1150
    // Collected: 650
    // Progress: 650/1150 = 56.52%

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  // Test 9: Shows remaining amount
  test('shows remaining amount for COLLECTING assets', () => {
    render(<AssetCard asset={mockAssetCollecting} />);

    // Remaining: 1150 - 650 = 500
    expect(screen.getByText(/500 remaining to fund/i)).toBeInTheDocument();
  });

  // Test 10: Shows correct stats
  test('displays correct stats', () => {
    render(<AssetCard asset={mockAssetCollecting} />);

    expect(screen.getByText('25')).toBeInTheDocument(); // pledges
  });
});

// ============================================================================
// MANUAL TESTING CHECKLIST
// ============================================================================

/**
 * MANUAL TESTING CHECKLIST
 *
 * Use this checklist to verify the component works correctly in the browser.
 */

export const manualTestChecklist = {
  visual: {
    'Card Appearance': [
      'Card has rounded-2xl corners',
      'Card has shadow on hover',
      'Card scales up on hover',
      'Card lifts up on hover (-4px)',
    ],
    Thumbnail: [
      'Thumbnail is 256px tall (h-64)',
      'Thumbnail has hover zoom effect',
      'Thumbnail shows gradient overlay on hover',
      'Fallback placeholder shows when no image',
      'Image error is handled gracefully',
    ],
    'Status Badges': [
      'Badge shows correct status text',
      'Badge has correct icon',
      'Badge has correct color scheme',
      'Badge has rounded-full shape',
      'Badge has backdrop blur effect',
    ],
    'Progress Bar': [
      'Progress bar shows correct percentage',
      'Progress bar has gradient color',
      'Progress bar animates on load',
      'Progress bar has shimmer effect',
      'Progress bar shows remaining amount',
    ],
    Buttons: [
      'Button has correct text',
      'Button has gradient background',
      'Button has hover effect',
      'Button shows loading state',
      'Button is disabled when loading',
    ],
  },

  functionality: {
    'COLLECTING Status': [
      'Shows progress section',
      'Shows "Contribute Now" button',
      'Redirects to asset page on click',
      'Shows correct funding amount',
      'Shows correct goal amount',
      'Shows correct progress percentage',
      'Shows remaining amount',
    ],
    'AVAILABLE Status': [
      'Shows "Instant Access" message',
      'Shows "Get for $1" button',
      'Shows price tag overlay',
      'Shows people count',
      'Purchase API is called on click',
      'Success toast appears after purchase',
      'Error toast appears on failure',
    ],
    'PURCHASED Status': [
      'Shows "Fully Funded" message',
      'Shows "View Asset" button',
      'Redirects to asset page',
      'Shows people count',
    ],
    'Other Statuses': [
      'Shows correct status badge',
      'Shows disabled button',
      'Redirects to asset page',
    ],
  },

  animations: {
    'Entrance Animations': [
      'Card fades in on mount',
      'Card slides up on mount',
      'Content animates with stagger',
      'Progress bar animates width',
    ],
    'Hover Animations': [
      'Card scales up on hover',
      'Card lifts up on hover',
      'Thumbnail zooms on hover',
      'Gradient overlay appears',
      'Button scales on hover',
    ],
    'Button Animations': [
      'Button scales down on click',
      'Loading spinner rotates',
      'Shimmer effect loops',
    ],
  },

  responsiveness: {
    Mobile: [
      'Card fits in 1 column grid',
      'Content is readable',
      'Buttons are tappable',
      'Text is not truncated',
    ],
    Tablet: ['Card fits in 2 column grid', 'Layout is balanced', 'Images scale correctly'],
    Desktop: ['Card fits in 3-4 column grid', 'Hover effects work', 'All content visible'],
  },

  accessibility: {
    'Keyboard Navigation': [
      'Card is focusable with Tab',
      'Enter key activates link',
      'Focus indicators are visible',
      'Tab order is logical',
    ],
    'Screen Reader': [
      'Title is announced',
      'Status is announced',
      'Button purpose is clear',
      'Links have meaningful text',
    ],
    'Visual Accessibility': [
      'Color contrast is sufficient',
      'Text is readable',
      'Icons have labels',
      'Error messages are clear',
    ],
  },

  performance: {
    'Loading Performance': [
      'Initial render is fast',
      'Animations run at 60fps',
      'No layout shifts',
      'Images load efficiently',
    ],
    'Interaction Performance': [
      'Hover effects are smooth',
      'Clicks respond quickly',
      'No janky animations',
      'API calls are fast',
    ],
  },
};

// ============================================================================
// API TESTING
// ============================================================================

/**
 * API ENDPOINT TESTING
 *
 * Test these scenarios with the API endpoints
 */

export const apiTestScenarios = {
  contribute: {
    endpoint: 'POST /api/contribute',
    success: {
      description: 'Successful contribution',
      request: {
        assetId: 'test-asset-1',
        amount: 1,
      },
      expectedResponse: {
        success: true,
        message: 'Contribution successful',
        assetId: 'test-asset-1',
        amount: 1,
      },
      expectedBehavior: [
        'Success toast appears',
        'Redirects to asset page',
        'Loading state shows',
        'Button is disabled during loading',
      ],
    },
    error: {
      description: 'Failed contribution',
      request: {
        assetId: 'invalid-id',
        amount: 1,
      },
      expectedResponse: {
        error: 'Asset not found',
      },
      expectedBehavior: [
        'Error toast appears',
        'Button becomes enabled',
        'No redirect occurs',
        'Error message is clear',
      ],
    },
  },

  purchase: {
    endpoint: 'POST /api/assets/[id]/purchase',
    success: {
      description: 'Successful purchase',
      request: {
        amount: 1,
      },
      expectedResponse: {
        success: true,
        purchaseId: 'expected-purchase-id',
        accessKey: 'expected-key',
      },
      expectedBehavior: [
        'Success toast appears',
        'Redirects to asset page with access=true',
        'Loading state shows',
        'Button is disabled during loading',
      ],
    },
    error: {
      description: 'Failed purchase',
      request: {
        amount: 1,
      },
      expectedResponse: {
        error: 'Insufficient wallet balance',
      },
      expectedBehavior: [
        'Error toast appears',
        'Button becomes enabled',
        'No redirect occurs',
        'Error message is clear',
      ],
    },
    alreadyPurchased: {
      description: 'Already purchased',
      request: {
        amount: 1,
      },
      expectedResponse: {
        error: 'You already have access to this asset',
      },
      expectedBehavior: [
        'Error toast appears',
        'Error mentions existing access',
        'Button becomes enabled',
      ],
    },
  },
};

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * EXAMPLE USAGE IN PAGES
 */

export function ExampleUsage() {
  // Example 1: Basic usage
  const basicExample = `
    import { AssetCard } from '@/components/dashboard'

    function MyPage() {
      const assets = [...] // Your asset data

      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )
    }
  `;

  // Example 2: With filtering
  const filterExample = `
    function AssetGrid({ status }: { status: string }) {
      const [assets, setAssets] = useState([])

      useEffect(() => {
        fetch(\`/api/assets?status=\${status}\`)
          .then(res => res.json())
          .then(data => setAssets(data))
      }, [status])

      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )
    }
  `;

  // Example 3: With pagination
  const paginationExample = `
    function AssetGrid() {
      const [page, setPage] = useState(1)
      const [assets, setAssets] = useState([])

      useEffect(() => {
        fetch(\`/api/assets?page=\${page}&limit=12\`)
          .then(res => res.json())
          .then(data => setAssets(data))
      }, [page])

      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
          <Pagination page={page} onPageChange={setPage} />
        </>
      )
    }
  `;

  return { basicExample, filterExample, paginationExample };
}

// ============================================================================
// TROUBLESHOOTING GUIDE
// ============================================================================

export const troubleshootingGuide = {
  issue: {
    'Card not rendering': {
      symptoms: ['Card does not appear on page'],
      solutions: [
        'Check browser console for errors',
        'Verify import path is correct',
        'Ensure asset data has required fields',
        'Check if parent component renders',
      ],
    },
    'Animations not working': {
      symptoms: ['No entrance animations', 'No hover effects'],
      solutions: [
        'Verify framer-motion is installed',
        'Check browser supports CSS animations',
        'Look for JavaScript errors',
        'Test in different browser',
      ],
    },
    'API calls failing': {
      symptoms: ['Button shows loading forever', 'Error toasts'],
      solutions: [
        'Check API routes are running',
        'Verify user is authenticated',
        'Check network tab in DevTools',
        'Test API endpoint directly',
        'Check CORS settings',
      ],
    },
    'Images not loading': {
      symptoms: ['Broken image icons', 'Placeholder shows'],
      solutions: [
        'Verify image URLs are valid',
        'Check CORS for external images',
        'Test image URLs in browser',
        'Check image format is supported',
      ],
    },
    'Progress bar incorrect': {
      symptoms: ['Wrong percentage', 'Wrong amounts'],
      solutions: [
        'Verify platformFee is correct',
        'Check targetPrice value',
        'Verify currentCollected value',
        'Test calculation manually',
      ],
    },
  },
};

export default {
  mockAssetCollecting,
  mockAssetAvailable,
  mockAssetPurchased,
  mockAssetRequested,
  manualTestChecklist,
  apiTestScenarios,
  ExampleUsage,
  troubleshootingGuide,
};
