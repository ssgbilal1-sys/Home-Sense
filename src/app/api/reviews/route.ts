import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// SQL to create Review table manually in Supabase SQL Editor
const CREATE_REVIEW_SQL = `
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
ALTER TABLE "Review" DISABLE ROW LEVEL SECURITY;
`

// Check if Review table exists, return helpful error if not
async function ensureReviewTable() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { error: testError } = await supabase.from('Review').select('id').limit(1)
  if (!testError) return // Table exists, all good

  if (testError.message.includes('could not find') || testError.message.includes('does not exist') || testError.message.includes('schema cache')) {
    // Try to create via pg Pool (works if DIRECT_URL is accessible)
    try {
      const { Pool } = await import('pg')
      const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
      if (databaseUrl && !databaseUrl.startsWith('file:')) {
        const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
        try {
          await pool.query(CREATE_REVIEW_SQL)
          console.log('Review table created via pg Pool')
          return
        } finally {
          await pool.end()
        }
      }
    } catch (pgError: any) {
      console.error('Could not create Review table via pg:', pgError.message)
    }

    // pg Pool failed — try Supabase SQL REST API
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
      const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '')
      const response = await fetch(`https://${projectId}.supabase.co/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: CREATE_REVIEW_SQL }),
      })
      if (response.ok) {
        console.log('Review table created via Supabase RPC')
        return
      }
    } catch (rpcError) {
      console.error('Could not create Review table via RPC:', rpcError)
    }

    // All methods failed — throw with instructions
    throw new Error('Review table does not exist. Please go to Supabase Dashboard → SQL Editor → Run this SQL:\n\n' + CREATE_REVIEW_SQL.trim())
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
