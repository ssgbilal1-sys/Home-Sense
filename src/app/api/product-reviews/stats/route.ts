import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/product-reviews/stats — Get average rating for all products
export async function GET() {
  try {
    const reviews = await db.productReview.findMany({
      where: { approved: true },
      select: { productId: true, rating: true },
    })

    const stats: Record<string, { avg: number; count: number }> = {}

    // Count and sum per product
    for (const r of reviews) {
      if (!stats[r.productId]) stats[r.productId] = { avg: 0, count: 0 }
      stats[r.productId].count++
      stats[r.productId].avg += r.rating
    }

    // Calculate averages
    for (const pid of Object.keys(stats)) {
      stats[pid].avg = stats[pid].count > 0 ? Math.round((stats[pid].avg / stats[pid].count) * 10) / 10 : 0
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Error fetching review stats:', error)
    if (error.message && (error.message.includes('could not find') || error.message.includes('does not exist'))) {
      return NextResponse.json({})
    }
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
