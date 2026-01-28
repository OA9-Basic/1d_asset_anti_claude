/**
 * Asset Action Button Component
 *
 * Displays the appropriate action button based on asset status
 */

import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingCart, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

import { getStatusConfig } from './AssetStatusBadge';

interface AssetActionButtonProps {
  assetId: string;
  status: string;
  title: string;
}

export function AssetActionButton({ assetId, status, title }: AssetActionButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const statusInfo = getStatusConfig(status);

  const handlePurchase = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      const res = await fetch(`/api/assets/${assetId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      toast({
        title: 'Purchase Successful!',
        description: `You now have access to ${title}`,
        variant: 'default',
      });

      router.push(`/assets/${assetId}?access=true`);
    } catch (error) {
      toast({
        title: 'Purchase Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (e: React.MouseEvent) => {
    if (status === 'COLLECTING') {
      router.push(`/assets/${assetId}`);
    } else if (status === 'AVAILABLE') {
      handlePurchase(e);
    }
  };

  switch (status) {
    case 'COLLECTING':
      return (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className={`w-full h-12 bg-gradient-to-r ${statusInfo.gradient} hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold rounded-xl`}
            onClick={handleAction}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <motion.div
                  className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Processing...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                Contribute Now
              </>
            )}
          </Button>
        </motion.div>
      );

    case 'AVAILABLE':
      return (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className={`w-full h-12 bg-gradient-to-r ${statusInfo.gradient} hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold rounded-xl`}
            onClick={handleAction}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <motion.div
                  className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Get for $1
              </>
            )}
          </Button>
        </motion.div>
      );

    case 'PURCHASED':
      return (
        <Button
          className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg font-semibold rounded-xl"
          onClick={() => router.push(`/assets/${assetId}`)}
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          View Asset
        </Button>
      );

    default:
      const Icon = statusInfo.icon;
      return (
        <Button
          className="w-full h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium rounded-xl cursor-not-allowed"
          variant="outline"
          disabled
        >
          <Icon className="w-5 h-5 mr-2" />
          {statusInfo.label}
        </Button>
      );
  }
}
