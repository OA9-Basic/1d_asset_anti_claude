'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import { BasicInfoStep } from './components/BasicInfoStep';
import { DetailsStep } from './components/DetailsStep';
import { FormNavigation } from './components/FormNavigation';
import { InfoCards } from './components/InfoCards';
import { ProgressBar } from './components/ProgressBar';
import { RequestHeader } from './components/RequestHeader';
import { ReviewStep } from './components/ReviewStep';
import { requestAssetSchema, type RequestAssetFormValues, steps } from './constants';

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

export default function RequestAssetPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push('/auth/sign-in');
    return null;
  }

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

      router.push('/');
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

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <RequestHeader />

      <div className="container-custom py-8 max-w-3xl">
        <ProgressBar currentStep={currentStep} />

        {/* Form Card */}
        <Card className="border-2 shadow-xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>{steps[currentStep - 1].description}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
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
          </CardContent>
        </Card>

        <InfoCards />
      </div>
    </div>
  );
}
