'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import { BasicInfoStep } from './components/BasicInfoStep';
import { CreateHeader } from './components/CreateHeader';
import { PricingStep } from './components/PricingStep';
import { ReviewStep } from './components/ReviewStep';
import { createAssetSchema, type CreateAssetFormValues, steps } from './constants';

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

export default function CreateAssetPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);

  const form = useForm<CreateAssetFormValues>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      title: '',
      description: '',
      type: undefined,
      deliveryType: undefined,
      thumbnail: '',
      sourceUrl: '',
      targetPrice: 0,
    },
    mode: 'onChange',
  });

  const watchedValues = form.watch();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleNext = async () => {
    const fieldsToValidate =
      currentStep === 1
        ? ['title', 'description', 'type', 'deliveryType']
        : ['targetPrice'];

    const isValid = await form.trigger(fieldsToValidate as Array<'title' | 'description' | 'type' | 'deliveryType' | 'targetPrice'>);
    if (isValid) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (values: CreateAssetFormValues) => {
    if (currentStep !== 3) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/assets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          targetPrice: values.targetPrice,
          thumbnail: values.thumbnail || undefined,
          type: values.type,
          deliveryType: values.deliveryType,
          sourceUrl: values.sourceUrl || undefined,
          featured: false,
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
            form.setError(field as FieldPath<CreateAssetFormValues>, { message });
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: data.error || 'Failed to create asset',
          });
        }
        return;
      }

      toast({
        title: 'Request Submitted!',
        description: 'Your asset request has been sent to the admin for review. You will be notified once it\'s approved.',
      });

      router.push('/');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create asset',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <CreateHeader />

      <div className="container-custom py-8 max-w-3xl">
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
                      <Sparkles className="w-3 h-3 text-violet-500" />
                    ) : null}
                    {step.title}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <Sparkles className="h-5 w-5" />
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
                    {currentStep === 2 && <PricingStep control={form.control} isSubmitting={isSubmitting} />}
                    {currentStep === 3 && <ReviewStep values={watchedValues} />}
                  </motion.div>
                </AnimatePresence>

                <div className="flex gap-3 pt-6 border-t">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="flex-1 h-11"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  ) : (
                    <Link href="/" className="flex-1">
                      <Button type="button" variant="outline" disabled={isSubmitting} className="w-full h-11">
                        Cancel
                      </Button>
                    </Link>
                  )}

                  {currentStep === 3 ? (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 h-11 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-md"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                      className="flex-1 h-11 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-md"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
