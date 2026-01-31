'use client';

import { ArrowLeft, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function ShareButton({ assetId }: { assetId: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/assets/${assetId}`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast({
          title: 'Link copied!',
          description: 'Asset link copied to clipboard',
        });
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        toast({
          title: 'Link copied!',
          description: 'Asset link copied to clipboard',
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Failed to copy',
        description: 'Could not copy link to clipboard',
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
      {copied ? (
        <>
          <ArrowLeft className="w-4 h-4 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share
        </>
      )}
    </Button>
  );
}
