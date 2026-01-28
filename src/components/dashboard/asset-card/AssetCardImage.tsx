/**
 * Asset Card Image Component
 *
 * Displays the asset thumbnail with loading state and error handling
 */

import { Film, Music, Image as ImageIcon, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface AssetCardImageProps {
  src: string | null;
  alt: string;
  type: string;
  className?: string;
}

const typeIcons = {
  VIDEO: Film,
  AUDIO: Music,
  IMAGE: ImageIcon,
  DOCUMENT: BookOpen,
};

export function AssetCardImage({ src, alt, type, className }: AssetCardImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const Icon = typeIcons[type as keyof typeof typeIcons] || ImageIcon;

  if (imageError || !src) {
    return (
      <div
        className={cn(
          'w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center rounded-t-xl',
          className
        )}
      >
        <div className="text-center">
          <Icon className="w-12 h-12 mx-auto mb-2 text-slate-400" />
          <p className="text-sm text-slate-500">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-48 rounded-t-xl overflow-hidden bg-slate-100 dark:bg-slate-800', className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 animate-pulse">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 hover:scale-105"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
