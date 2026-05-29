import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth'

// GET single product (PUBLIC)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PUT update product (ADMIN ONLY)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const auth = await verifyAdmin()
    if (!auth.authenticated) return auth.response!

    const { id } = await params
    const body = await request.json()
    const { name, description, price, image, images, video, category, featured, order } = body

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(image !== undefined && { image }),
        ...(images !== undefined && { images }),
        ...(video !== undefined && { video }),
        ...(category !== undefined && { category }),
        ...(featured !== undefined && { featured }),
        ...(order !== undefined && { order }),
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE product (ADMIN ONLY)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const auth = await verifyAdmin()
    if (!auth.authenticated) return auth.response!

    const { id } = await params
    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
