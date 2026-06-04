import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/product-reviews?productId=xxx — Fetch approved reviews for a product
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (productId) {
      // Public: fetch approved reviews for a specific product
      const reviews = await db.productReview.findMany({
        where: { productId, approved: true },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(reviews)
    }

    // Admin: fetch all reviews (including unapproved)
    const reviews = await db.productReview.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(reviews)
  } catch (error: any) {
    console.error('Error fetching product reviews:', error)
    if (error.message && (error.message.includes('could not find') || error.message.includes('does not exist') || error.message.includes('schema cache'))) {
      return NextResponse.json({ error: 'ProductReview table not found. Please run the SQL query to create it.', tableMissing: true }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST /api/product-reviews — Submit a new review (public)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, name, rating, comment } = body

    if (!productId || !name || !comment) {
      return NextResponse.json({ error: 'Product, name, and comment are required.' }, { status: 400 })
    }

    const review = await db.productReview.create({
      data: {
        productId,
        name: String(name).trim(),
        rating: Math.min(5, Math.max(1, parseInt(String(rating)) || 5)),
        comment: String(comment).trim(),
        approved: false, // Needs admin approval
      },
    })

    return NextResponse.json({ success: true, message: 'Review submitted! It will appear after approval.', review }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating product review:', error)
    if (error.message && (error.message.includes('could not find') || error.message.includes('does not exist'))) {
      return NextResponse.json({ error: 'ProductReview table not found. Please run the SQL query to create it.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
