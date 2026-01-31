import { motion } from 'framer-motion';

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Preview Image Skeleton */}
              <div className="border-2 overflow-hidden rounded-lg bg-card">
                <div className="aspect-video bg-muted animate-pulse shimmer" />
                <div className="p-6 space-y-4">
                  <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                    <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>

              {/* Details Grid Skeleton */}
              <div className="border-2 rounded-lg bg-card">
                <div className="p-6">
                  <div className="h-6 w-40 bg-muted animate-pulse rounded mb-4" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                        <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Action Card Skeleton */}
                <div className="border-2 bg-gradient-to-br from-violet-500/10 to-purple-600/10 rounded-lg">
                  <div className="p-6 space-y-4">
                    <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-12 w-full bg-muted/50 animate-pulse rounded-full" />
                    <div className="h-10 w-full bg-muted animate-pulse rounded" />
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </div>

                {/* Stats Card Skeleton */}
                <div className="border-2 rounded-lg bg-card">
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
