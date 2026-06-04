import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/product-reviews/[id] — Approve/unapprove a review (admin)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const data: Record<string, any> = {}
    if (body.approved !== undefined) data.approved = Boolean(body.approved)
    if (body.name !== undefined) data.name = String(body.name)
    if (body.rating !== undefined) data.rating = Math.min(5, Math.max(1, parseInt(String(body.rating)) || 5))
    if (body.comment !== undefined) data.comment = String(body.comment)

    const review = await db.productReview.update({
      where: { id },
      data,
    })

    return NextResponse.json(review)
  } catch (error: any) {
    console.error('Error updating product review:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

// DELETE /api/product-reviews/[id] — Delete a review (admin)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.productReview.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting product review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
