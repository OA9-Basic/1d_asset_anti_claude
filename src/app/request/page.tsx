'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  ArrowLeft,
  PlusCircle,
  Check,
  ChevronRight,
  ChevronLeft,
  Info,
  Lightbulb,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const requestAssetSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  type: z.enum(
    ['COURSE', 'AI_MODEL', 'SAAS', 'SOFTWARE', 'TEMPLATE', 'CODE', 'MODEL_3D', 'EBOOK', 'OTHER'],
    {
      required_error: 'Please select an asset type',
    }
  ),
  deliveryType: z.enum(['DOWNLOAD', 'STREAM', 'EXTERNAL', 'HYBRID'], {
    required_error: 'Please select a delivery type',
  }),
  estimatedPrice: z
    .number()
    .min(1, 'Price must be at least $1')
    .max(10000, 'Price cannot exceed $10,000'),
  sourceUrl: z.string().url('Must be a valid URL'),
  whyThisAsset: z
    .string()
    .min(20, 'Please provide at least 20 characters')
    .max(500, 'Cannot exceed 500 characters'),
  additionalNotes: z.string().max(500, 'Cannot exceed 500 characters').optional().or(z.literal('')),
});

type RequestAssetFormValues = z.infer<typeof requestAssetSchema>;

const assetTypes = [
  {
    value: 'COURSE',
    label: 'Online Course',
    description: 'Video courses, tutorials, training programs',
  },
  { value: 'AI_MODEL', label: 'AI Model', description: 'Machine learning models, AI tools' },
  { value: 'SAAS', label: 'SaaS Subscription', description: 'Software as a Service subscriptions' },
  { value: 'SOFTWARE', label: 'Software', description: 'Desktop applications, tools, utilities' },
  { value: 'TEMPLATE', label: 'Template', description: 'Website templates, design templates' },
  { value: 'CODE', label: 'Code/Script', description: 'Source code, scripts, snippets' },
  { value: 'MODEL_3D', label: '3D Model', description: '3D assets, models, textures' },
  { value: 'EBOOK', label: 'E-Book', description: 'Digital books, guides, documentation' },
  { value: 'OTHER', label: 'Other', description: 'Any other type of digital asset' },
];

const deliveryTypes = [
  { value: 'DOWNLOAD', label: 'Direct Download', description: 'File download (ZIP, PDF, etc.)' },
  { value: 'STREAM', label: 'Streaming', description: 'Video/audio streaming access' },
  {
    value: 'EXTERNAL',
    label: 'External Platform',
    description: 'Access on external website/platform',
  },
  { value: 'HYBRID', label: 'Hybrid', description: 'Multiple delivery formats' },
];

const steps = [
  { id: 1, title: 'Basic Info', description: 'Asset details' },
  { id: 2, title: 'Details', description: 'More information' },
  { id: 3, title: 'Review', description: 'Preview & submit' },
];

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

  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Request Asset</h1>
              <p className="text-sm text-muted-foreground">
                Suggest a digital asset to add to the platform
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-8 max-w-3xl">
        {/* Progress Indicator */}
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
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
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
                          control={form.control}
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
                            control={form.control}
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
                            control={form.control}
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
                          control={form.control}
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
                    )}

                    {/* Step 2: Details */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                    )}

                    {/* Step 3: Preview */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <Card className="bg-muted/30">
                          <CardHeader>
                            <CardTitle className="text-lg">Review Your Request</CardTitle>
                            <CardDescription>
                              Please review all information before submitting
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Title</span>
                                <p className="font-medium mt-1">{watchedValues.title}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Type</span>
                                <p className="font-medium mt-1">
                                  {assetTypes.find((t) => t.value === watchedValues.type)?.label}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Delivery Type</span>
                                <p className="font-medium mt-1">
                                  {
                                    deliveryTypes.find(
                                      (t) => t.value === watchedValues.deliveryType
                                    )?.label
                                  }
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Estimated Price</span>
                                <p className="font-medium mt-1">${watchedValues.estimatedPrice}</p>
                              </div>
                            </div>

                            <div>
                              <span className="text-muted-foreground text-sm">Description</span>
                              <p className="text-sm mt-1 whitespace-pre-wrap">
                                {watchedValues.description}
                              </p>
                            </div>

                            <div>
                              <span className="text-muted-foreground text-sm">Source URL</span>
                              <p className="text-sm mt-1 text-primary break-all">
                                {watchedValues.sourceUrl}
                              </p>
                            </div>

                            <div>
                              <span className="text-muted-foreground text-sm">Why this asset</span>
                              <p className="text-sm mt-1 whitespace-pre-wrap">
                                {watchedValues.whyThisAsset}
                              </p>
                            </div>

                            {watchedValues.additionalNotes && (
                              <div>
                                <span className="text-muted-foreground text-sm">
                                  Additional Notes
                                </span>
                                <p className="text-sm mt-1 whitespace-pre-wrap">
                                  {watchedValues.additionalNotes}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
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
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        className="w-full h-11"
                      >
                        Cancel
                      </Button>
                    </Link>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-11 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {currentStep === 3 ? 'Submitting...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        {currentStep === 3 ? (
                          <>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Submit Request
                          </>
                        ) : (
                          <>
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card className="border bg-muted/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">How it works</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </div>
                <p className="text-muted-foreground">Submit your asset request with details</p>
              </div>
              <div className="flex gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  2
                </div>
                <p className="text-muted-foreground">Admin reviews the request</p>
              </div>
              <div className="flex gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  3
                </div>
                <p className="text-muted-foreground">Approved requests go to community voting</p>
              </div>
              <div className="flex gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  4
                </div>
                <p className="text-muted-foreground">Popular requests are added to the platform</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-muted/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Tips for approval</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Provide detailed, accurate information</p>
              <p>• Include the official source URL</p>
              <p>• Set a realistic estimated price</p>
              <p>• Explain why the community would want this</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
