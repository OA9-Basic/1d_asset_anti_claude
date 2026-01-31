'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateAssetFormValues } from '../constants';
import { assetTypes, deliveryTypes } from '../constants';

interface ReviewStepProps {
  values: CreateAssetFormValues;
}

export function ReviewStep({ values }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Review Your Asset</CardTitle>
          <CardDescription>
            Please review all information before submitting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Title</span>
              <p className="font-medium mt-1">{values.title}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Type</span>
              <p className="font-medium mt-1">
                {assetTypes.find((t) => t.value === values.type)?.label}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Delivery Type</span>
              <p className="font-medium mt-1">
                {deliveryTypes.find((t) => t.value === values.deliveryType)?.label}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Target Price</span>
              <p className="font-medium mt-1">${values.targetPrice}</p>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground text-sm">Description</span>
            <p className="text-sm mt-1 whitespace-pre-wrap">{values.description}</p>
          </div>

          {values.thumbnail && (
            <div>
              <span className="text-muted-foreground text-sm">Thumbnail</span>
              <p className="text-sm mt-1 text-primary break-all">{values.thumbnail}</p>
            </div>
          )}

          {values.sourceUrl && (
            <div>
              <span className="text-muted-foreground text-sm">Source URL</span>
              <p className="text-sm mt-1 text-primary break-all">{values.sourceUrl}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
