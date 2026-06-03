import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth'

// PUT /api/reviews/[id] — Update a review (ADMIN ONLY)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin()
    if (!auth.authenticated) return auth.response!

    const { id } = await params
    const body = await request.json()
    const { name, rating, comment, date, approved, order } = body

    const review = await db.review.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(rating !== undefined && { rating }),
        ...(comment !== undefined && { comment }),
        ...(date !== undefined && { date }),
        ...(approved !== undefined && { approved }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

// DELETE /api/reviews/[id] — Delete a review (ADMIN ONLY)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin()
    if (!auth.authenticated) return auth.response!

    const { id } = await params
    await db.review.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
