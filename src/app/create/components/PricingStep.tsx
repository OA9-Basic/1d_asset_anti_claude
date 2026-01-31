'use client';

import { Info } from 'lucide-react';
import type { Control } from 'react-hook-form';

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';


interface PricingStepProps {
  control: Control<Record<string, unknown>>;
  isSubmitting: boolean;
}

export function PricingStep({ control, isSubmitting }: PricingStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="targetPrice"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium">
              Target Price ($) *
            </FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="99.00"
                  min="1"
                  max="10000"
                  step="0.01"
                  value={field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : undefined;
                    field.onChange(value);
                  }}
                  disabled={isSubmitting}
                  className="h-11 pl-7 bg-zinc-50 dark:bg-zinc-900"
                />
              </div>
            </FormControl>
            <FormDescription className="text-xs">
              The total amount needed to purchase this asset. Once reached, the asset will be bought and all contributors get access.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="sourceUrl"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium">Source URL</FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder="https://example.com/asset"
                {...field}
                disabled={isSubmitting}
                className="h-11 bg-zinc-50 dark:bg-zinc-900"
              />
            </FormControl>
            <FormDescription className="text-xs">
              Optional: Link to where this asset can be purchased (for admin verification)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Info className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">How the $1 contribution model works</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Each user can contribute $1 at a time to any asset</li>
              <li>• Once the target price is reached, the platform purchases the asset</li>
              <li>• All contributors get access to the purchased asset</li>
              <li>• If there are excess funds, they are refunded to contributors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
