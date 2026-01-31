'use client';

import { useState } from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { assetTypes, deliveryTypes } from '../constants';

interface BasicInfoStepProps {
  control: any;
  isSubmitting: boolean;
}

export function BasicInfoStep({ control, isSubmitting }: BasicInfoStepProps) {
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

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
                placeholder="e.g., Complete React Masterclass 2024"
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
                placeholder="Describe the asset, its contents, target audience, learning outcomes, and key features..."
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
          name="deliveryType"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium">Delivery Type *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="h-11 bg-zinc-50 dark:bg-zinc-900">
                    <SelectValue placeholder="Select delivery type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {deliveryTypes.map((type) => (
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
      </div>

      <FormField
        control={control}
        name="thumbnail"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium">Thumbnail URL</FormLabel>
            <FormControl>
              <Input
                placeholder="https://example.com/thumbnail.jpg"
                {...field}
                disabled={isSubmitting}
                className="h-11 bg-zinc-50 dark:bg-zinc-900"
              />
            </FormControl>
            <FormDescription className="text-xs">
              Optional: Provide a URL to a preview image for the asset
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
