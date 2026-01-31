'use client';

import { Info } from 'lucide-react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { deliveryTypes } from '../constants';

interface DetailsStepProps {
  control: any;
  isSubmitting: boolean;
}

export function DetailsStep({ control, isSubmitting }: DetailsStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="deliveryType"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium">
              Preferred Delivery Type *
            </FormLabel>
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

      <FormField
        control={control}
        name="whyThisAsset"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium">
              Why this asset? *
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Explain why this asset would be valuable to the community. Who would benefit from it? What problems does it solve?"
                rows={4}
                {...field}
                disabled={isSubmitting}
                className="resize-none bg-zinc-50 dark:bg-zinc-900"
              />
            </FormControl>
            <FormDescription className="text-xs">
              {(field.value || '').length}/500 characters
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="additionalNotes"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium">
              Additional Notes
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any additional information that might help with the review process..."
                rows={3}
                {...field}
                disabled={isSubmitting}
                className="resize-none bg-zinc-50 dark:bg-zinc-900"
              />
            </FormControl>
            <FormDescription className="text-xs">
              {(field.value || '').length}/500 characters
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
            <h4 className="font-medium text-sm">What happens next?</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Your request will be reviewed by our team</li>
              <li>• Approved requests will be available for community voting</li>
              <li>• Popular requests will be prioritized for acquisition</li>
              <li>• Once funded, all contributors get access to the asset</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
