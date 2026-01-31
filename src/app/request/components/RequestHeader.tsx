'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function RequestHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
      <div className="container-custom py-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Request Asset</h1>
            <p className="text-sm text-muted-foreground">
              Suggest a digital asset to add to the platform
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
