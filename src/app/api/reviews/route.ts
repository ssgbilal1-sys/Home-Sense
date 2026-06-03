import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

// Ensure the Review table exists in Supabase (fallback if migration didn't run)
async function ensureReviewTable() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  // Try a simple query first
  const { error: testError } = await supabase.from('Review').select('id').limit(1)
  if (!testError) return // Table exists, all good

  if (!testError.message.includes('could not find') && !testError.message.includes('does not exist') && !testError.message.includes('schema cache')) {
    return // Some other error, let it propagate naturally
  }

  console.log('Review table not found, creating via direct SQL...')
  const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!databaseUrl || databaseUrl.startsWith('file:')) {
    throw new Error('Review table does not exist and cannot auto-create. Please add DIRECT_URL env variable or create the table manually in Supabase SQL Editor.')
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Review" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "rating" INTEGER NOT NULL DEFAULT 5,
        "comment" TEXT NOT NULL,
        "date" TEXT NOT NULL DEFAULT '',
        "approved" BOOLEAN NOT NULL DEFAULT true,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
      );
    `)
    await pool.query(`ALTER TABLE "Review" DISABLE ROW LEVEL SECURITY;`)
    console.log('Review table created successfully')
  } finally {
    await pool.end()
  }
}

// GET /api/reviews — Fetch reviews (public: only approved; admin: all)
export async function GET(request: Request) {
  try {
    await ensureReviewTable()
    const { searchParams } = new URL(request.url)
    const approvedOnly = searchParams.get('approved') === 'true'

    const where: Record<string, any> = {}
    if (approvedOnly) {
      where.approved = { equals: true }
    }

    const reviews = await db.review.findMany({
      where: approvedOnly ? where : undefined,
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST /api/reviews — Create a new review (ADMIN ONLY)
export async function POST(request: Request) {
  try {
    await ensureReviewTable()
    const auth = await verifyAdmin()
    if (!auth.authenticated) return auth.response!

    const body = await request.json()
    const { name, rating, comment, date, approved, order } = body

    if (!name || !comment) {
      return NextResponse.json(
        { error: 'Name and comment are required' },
        { status: 400 }
      )
    }

    const review = await db.review.create({
      data: {
        name,
        rating: rating ?? 5,
        comment,
        date: date || '',
        approved: approved ?? true,
        order: order ?? 0,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review: ' + (error.message || 'Unknown error') }, { status: 500 })
  }
}
