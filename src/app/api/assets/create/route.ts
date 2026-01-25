import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'
import { z } from 'zod'

const createAssetSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  targetPrice: z.string().or(z.number()).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num) || num <= 0) throw new Error('Invalid target price')
    return num
  }),
  type: z.enum(['COURSE', 'AI_MODEL', 'SAAS', 'SOFTWARE', 'TEMPLATE', 'OTHER']).optional(),
  thumbnail: z.string().url().optional(),
  metadata: z.record(z.any()).optional().default({}),
  featured: z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createAssetSchema.parse(body)

    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100)

    const existingAsset = await db.asset.findUnique({
      where: { slug },
    })

    const finalSlug = existingAsset ? `${slug}-${Date.now().toString(36)}` : slug

    const asset = await db.asset.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        slug: finalSlug,
        type: validatedData.type || 'OTHER',
        targetPrice: validatedData.targetPrice,
        status: 'COLLECTING',
        thumbnail: validatedData.thumbnail,
        metadata: validatedData.metadata,
        featured: validatedData.featured,
      },
    })

    return NextResponse.json({
      id: asset.id,
      slug: asset.slug,
      status: asset.status,
      targetPrice: asset.targetPrice,
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 })
    }

    console.error('Asset creation error:', error)
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 })
  }
}
