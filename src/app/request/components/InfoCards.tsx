'use client';

import { Info, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function InfoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <Card className="border bg-muted/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">How it works</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div className="flex gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              1
            </div>
            <p className="text-muted-foreground">Submit your asset request with details</p>
          </div>
          <div className="flex gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              2
            </div>
            <p className="text-muted-foreground">Admin reviews the request</p>
          </div>
          <div className="flex gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              3
            </div>
            <p className="text-muted-foreground">Approved requests go to community voting</p>
          </div>
          <div className="flex gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              4
            </div>
            <p className="text-muted-foreground">Popular requests are added to the platform</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border bg-muted/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Tips for approval</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Provide detailed, accurate information</p>
          <p>• Include the official source URL</p>
          <p>• Set a realistic estimated price</p>
          <p>• Explain why the community would want this</p>
        </CardContent>
      </Card>
    </div>
  );
}
