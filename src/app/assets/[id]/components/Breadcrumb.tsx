import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function Breadcrumb({ assetId: _assetId }: { assetId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
    >
      <Link
        href="/marketplace"
        className="hover:text-primary transition-colors flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Marketplace
      </Link>
      <span>/</span>
      <span className="text-foreground font-medium">Asset Details</span>
    </motion.div>
  );
}
