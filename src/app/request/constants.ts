import { z } from 'zod';

export const requestAssetSchema = z.object({
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

export type RequestAssetFormValues = z.infer<typeof requestAssetSchema>;

export const assetTypes = [
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

export const deliveryTypes = [
  { value: 'DOWNLOAD', label: 'Direct Download', description: 'File download (ZIP, PDF, etc.)' },
  { value: 'STREAM', label: 'Streaming', description: 'Video/audio streaming access' },
  {
    value: 'EXTERNAL',
    label: 'External Platform',
    description: 'Access on external website/platform',
  },
  { value: 'HYBRID', label: 'Hybrid', description: 'Multiple delivery formats' },
];

export const steps = [
  { id: 1, title: 'Basic Info', description: 'Asset details' },
  { id: 2, title: 'Details', description: 'More information' },
  { id: 3, title: 'Review', description: 'Preview & submit' },
];
