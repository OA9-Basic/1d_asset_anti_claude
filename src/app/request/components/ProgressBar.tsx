'use client';

import { Check } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { steps } from '../constants';

interface ProgressBarProps {
  currentStep: number;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const progressPercentage = (currentStep / 3) * 100;

  return (
    <Card className="mb-6 border-2">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Step {currentStep} of 3</span>
              <span className="text-sm text-muted-foreground">
                - {steps[currentStep - 1].title}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    step <= currentStep
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {steps.map((step) => (
              <span
                key={step.id}
                className={`flex items-center gap-1 ${
                  currentStep === step.id ? 'text-primary font-medium' : ''
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : currentStep === step.id ? (
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-600" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-muted" />
                )}
                {step.title}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
