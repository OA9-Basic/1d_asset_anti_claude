'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, ArrowLeft, Sparkles, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
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

const createAssetSchema = z.object({
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
  thumbnail: z.string().optional(),
  sourceUrl: z.string().optional(),
  targetPrice: z
    .number()
    .min(1, 'Price must be at least $1')
    .max(10000, 'Price cannot exceed $10,000'),
});

type CreateAssetFormValues = z.infer<typeof createAssetSchema>;

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
  { id: 2, title: 'Pricing & Goal', description: 'Set your target' },
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
        ? ['title', 'description', 'type', 'deliveryType']
        : ['targetPrice'];

    const isValid = await form.trigger(fieldsToValidate as Array<'title' | 'description' | 'type' | 'deliveryType' | 'targetPrice'>);
    if (isValid) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      // Show errors for current step
      if (currentStep === 1) {
        form.trigger(['title', 'description', 'type', 'deliveryType']);
      } else {
        form.trigger(['targetPrice']);
      }
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (values: CreateAssetFormValues) => {
    if (currentStep !== 3) {
      handleNext();
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
          featured: false,
          metadata: {
            deliveryType: values.deliveryType,
            sourceUrl: values.sourceUrl,
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
        title: 'Asset Created!',
        description: 'Your asset has been successfully created and is now live.',
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

  const calculatePlatformFee = () => {
    const price = watchedValues.targetPrice || 0;
    return price * 0.15;
  };

  const calculateTotal = () => {
    const price = watchedValues.targetPrice || 0;
    return price + calculatePlatformFee();
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
              <h1 className="text-2xl font-bold">Create Asset</h1>
              <p className="text-sm text-muted-foreground">
                List a new digital asset on the marketplace
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
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">Title *</FormLabel>
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
                                  placeholder="Describe your asset in detail. What does it include? Who is it for? What will people learn or gain?"
                                  rows={5}
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
                            name="deliveryType"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-medium">
                                  Delivery Type *
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  disabled={isSubmitting}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-11 bg-zinc-50 dark:bg-zinc-900">
                                      <SelectValue placeholder="Select delivery" />
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
                          control={form.control}
                          name="thumbnail"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">
                                Thumbnail Image URL
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="url"
                                  placeholder="https://example.com/image.jpg"
                                  {...field}
                                  disabled={isSubmitting}
                                  className="h-11 bg-zinc-50 dark:bg-zinc-900"
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                A preview image for your asset. Recommended size: 1200x630px.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
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
                                Link to where this asset can be purchased (for reference)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 2: Pricing & Goal */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
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
                                    {...field}
                                    disabled={isSubmitting}
                                    className="h-11 pl-7 bg-zinc-50 dark:bg-zinc-900"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs">
                                The amount needed to purchase this asset
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-800">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">Pricing Breakdown</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Target Price</span>
                              <span className="font-medium">
                                ${watchedValues.targetPrice || '0.00'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Platform Fee (15%)</span>
                              <span className="font-medium text-orange-600">
                                +${calculatePlatformFee().toFixed(2)}
                              </span>
                            </div>
                            <div className="border-t pt-3 flex justify-between">
                              <span className="font-semibold">Total Funding Goal</span>
                              <span className="font-bold text-lg text-primary">
                                ${calculateTotal().toFixed(2)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">i</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">How pricing works</h4>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Set your target price for the asset</li>
                                <li>• A 15% platform fee is added to cover operational costs</li>
                                <li>• Community members contribute towards the total goal</li>
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
                            <CardTitle className="text-lg">Review Your Asset</CardTitle>
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
                                <span className="text-muted-foreground">Target Price</span>
                                <p className="font-medium mt-1">${watchedValues.targetPrice}</p>
                              </div>
                            </div>

                            <div>
                              <span className="text-muted-foreground text-sm">Description</span>
                              <p className="text-sm mt-1 whitespace-pre-wrap">
                                {watchedValues.description}
                              </p>
                            </div>

                            {watchedValues.thumbnail && (
                              <div>
                                <span className="text-muted-foreground text-sm">Thumbnail</span>
                                <div className="mt-2 rounded-lg overflow-hidden border relative w-full h-48">
                                  <Image
                                    src={watchedValues.thumbnail}
                                    alt="Thumbnail"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 768px"
                                    className="object-cover"
                                  />
                                </div>
                              </div>
                            )}

                            {watchedValues.sourceUrl && (
                              <div>
                                <span className="text-muted-foreground text-sm">Source URL</span>
                                <p className="text-sm mt-1 text-primary break-all">
                                  {watchedValues.sourceUrl}
                                </p>
                              </div>
                            )}

                            <div className="border-t pt-4 mt-4">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Total Funding Goal</span>
                                <span className="text-2xl font-bold text-primary">
                                  ${calculateTotal().toFixed(2)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Includes ${calculatePlatformFee().toFixed(2)} platform fee
                              </p>
                            </div>
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
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      className="flex-1 h-11"
                      onClick={() => router.push('/')}
                    >
                      Cancel
                    </Button>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-11 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {currentStep === 3 ? 'Creating...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        {currentStep === 3 ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Create Asset
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

        {/* Tips Card */}
        <Card className="mt-6 border bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tips for a great asset listing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Use a clear, descriptive title that includes the asset name and version/year</p>
            <p>• Provide a detailed description explaining what users will get</p>
            <p>• Set a realistic target price based on current market value</p>
            <p>• Use a high-quality thumbnail image to attract more contributors</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
