import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth'

// GET /api/reviews — Fetch reviews (public: only approved; admin: all)
export async function GET(request: Request) {
  try {
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
