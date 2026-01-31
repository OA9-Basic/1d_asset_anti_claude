import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center p-8"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Failed to Load Asset</h2>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t load the asset details. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onRetry} variant="default">
            Try Again
          </Button>
          <Link href="/marketplace">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
