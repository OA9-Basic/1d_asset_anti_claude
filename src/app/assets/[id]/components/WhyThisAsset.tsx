'use client';

import { DollarSign, Star, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WhyThisAssetProps {
  contributionsCount: number;
}

export function WhyThisAsset({ contributionsCount }: WhyThisAssetProps) {
  return (
    <Card className="border-2 bg-gradient-to-br from-violet-500/5 to-purple-600/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          Why This Asset?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">High Quality</h4>
              <p className="text-sm text-muted-foreground">
                Verified premium content from trusted sources
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Great Value</h4>
              <p className="text-sm text-muted-foreground">
                Access premium assets for just $1
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Community Funded</h4>
              <p className="text-sm text-muted-foreground">
                Backed by {contributionsCount} contributor
                {contributionsCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
