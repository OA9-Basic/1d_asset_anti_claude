'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';

import { BasicInfoStep } from '@/app/request/components/BasicInfoStep';
import { DetailsStep } from '@/app/request/components/DetailsStep';
import { FormNavigation } from '@/app/request/components/FormNavigation';
import { InfoCards } from '@/app/request/components/InfoCards';
import { ProgressBar } from '@/app/request/components/ProgressBar';
import { ReviewStep } from '@/app/request/components/ReviewStep';
import { requestAssetSchema, type RequestAssetFormValues, steps } from '@/app/request/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

interface RequestAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestAssetModal({ open, onOpenChange }: RequestAssetModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);

  const form = useForm<RequestAssetFormValues>({
    resolver: zodResolver(requestAssetSchema),
    defaultValues: {
      title: '',
      description: '',
      type: undefined,
      deliveryType: undefined,
      estimatedPrice: undefined,
      sourceUrl: '',
      whyThisAsset: '',
      additionalNotes: '',
    },
    mode: 'onSubmit',
  });

  const watchedValues = form.watch();

  const handleNext = async () => {
    const fieldsToValidate =
      currentStep === 1
        ? ['title', 'description', 'type', 'estimatedPrice', 'sourceUrl']
        : ['deliveryType', 'whyThisAsset', 'additionalNotes'];

    const isValid = await form.trigger(fieldsToValidate as Array<'title' | 'description' | 'type' | 'estimatedPrice' | 'sourceUrl' | 'deliveryType' | 'whyThisAsset' | 'additionalNotes'>);
    if (isValid) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (values: RequestAssetFormValues) => {
    if (currentStep !== 3) {
      handleNext();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/asset-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          type: values.type,
          deliveryType: values.deliveryType,
          estimatedPrice: values.estimatedPrice,
          sourceUrl: values.sourceUrl,
          metadata: {
            whyThisAsset: values.whyThisAsset,
            additionalNotes: values.additionalNotes,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((detail: { path: string[]; message: string }) => {
            fieldErrors[detail.path[0]] = detail.message;
          });
          Object.entries(fieldErrors).forEach(([field, message]) => {
            form.setError(field as FieldPath<RequestAssetFormValues>, { message });
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: data.error || 'Failed to submit request',
          });
        }
        return;
      }

      toast({
        title: 'Request Submitted!',
        description:
          'Your asset request has been submitted for review. The admin will review it shortly.',
      });

      // Reset form and close modal
      form.reset();
      setCurrentStep(1);
      onOpenChange(false);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit request',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset when closing
      form.reset();
      setCurrentStep(1);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogOverlay className="bg-black/80" />
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
                <PlusCircle className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div>
                <DialogTitle className="text-zinc-900 dark:text-zinc-100">
                  {steps[currentStep - 1].title}
                </DialogTitle>
                <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                  {steps[currentStep - 1].description}
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={() => handleOpenChange(false)}
              className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>
          <ProgressBar currentStep={currentStep} />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                >
                  {currentStep === 1 && <BasicInfoStep control={form.control} isSubmitting={isSubmitting} />}
                  {currentStep === 2 && <DetailsStep control={form.control} isSubmitting={isSubmitting} />}
                  {currentStep === 3 && <ReviewStep values={watchedValues} />}
                </motion.div>
              </AnimatePresence>

              <FormNavigation
                currentStep={currentStep}
                isSubmitting={isSubmitting}
                onBack={handleBack}
              />
            </form>
          </Form>

          <div className="mt-6">
            <InfoCards />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
