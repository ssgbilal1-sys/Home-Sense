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
    const { name, description, price, discountPrice, onSale, discountPercent, discountDuration, image, images, video, category, featured, order } = body

    // Auto-derive onSale and discountPrice from discountPercent if provided
    let finalDiscountPrice = discountPrice
    let finalOnSale = onSale
    if (discountPercent !== undefined) {
      const hasDiscount = discountPercent > 0
      const numPrice = parseFloat(String(price || 0).replace(/[^0-9.]/g, ''))
      finalDiscountPrice = hasDiscount && numPrice > 0
        ? 'Rs ' + Math.round(numPrice * (1 - discountPercent / 100)).toLocaleString('en-PK')
        : ''
      finalOnSale = hasDiscount
    }

    // Calculate discount expiry time
    let discountExpiresAt: string | null | undefined = undefined
    if (discountPercent !== undefined && discountDuration !== undefined) {
      if (discountPercent > 0 && discountDuration > 0) {
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + discountDuration)
        discountExpiresAt = expiry.toISOString()
      } else {
        discountExpiresAt = null // Clear expiry if no discount or no duration
      }
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(finalDiscountPrice !== undefined && { discountPrice: finalDiscountPrice }),
        ...(finalOnSale !== undefined && { onSale: finalOnSale }),
        ...(discountPercent !== undefined && { discountPercent }),
        ...(discountExpiresAt !== undefined && { discountExpiresAt }),
        ...(image !== undefined && { image }),
        ...(images !== undefined && { images }),
        ...(video !== undefined && { video }),
        ...(category !== undefined && { category }),
        ...(featured !== undefined && { featured }),
        ...(order !== undefined && { order }),
      }
    })

    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Error updating product:', error)
    const errMsg = error?.message || 'Failed to update product'
    return NextResponse.json({ error: errMsg }, { status: 500 })
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
