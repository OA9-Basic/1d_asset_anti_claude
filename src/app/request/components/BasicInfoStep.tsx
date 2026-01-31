'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { assetTypes } from '../constants';


interface BasicInfoStepProps {
  control: Control<Record<string, unknown>>;
  isSubmitting: boolean;
}

export function BasicInfoStep({ control, isSubmitting }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium">Asset Title *</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Advanced React Course 2024"
                {...field}
                disabled={isSubmitting}
                className="h-11 bg-zinc-50 dark:bg-zinc-900"
              />
            </FormControl>
            <FormDescription className="text-xs">
              {field.value.length}/100 characters
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium">Description *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the asset, its contents, target audience, and why it would be valuable..."
                rows={4}
                {...field}
                disabled={isSubmitting}
                className="resize-none bg-zinc-50 dark:bg-zinc-900"
              />
            </FormControl>
            <FormDescription className="text-xs">
              {field.value.length}/1000 characters
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium">Asset Type *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="h-11 bg-zinc-50 dark:bg-zinc-900">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="estimatedPrice"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium">
                Estimated Price ($) *
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
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="sourceUrl"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium">Source URL *</FormLabel>
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
              Link to where this asset can be purchased (for admin verification)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
