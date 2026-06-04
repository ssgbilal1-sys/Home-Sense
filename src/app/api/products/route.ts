import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth'

// GET all products (PUBLIC - anyone can view)
export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST create a new product (ADMIN ONLY - requires authentication)
export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const auth = await verifyAdmin()
    if (!auth.authenticated) return auth.response!

    const body = await request.json()
    const { name, description, price, discountPrice, onSale, discountPercent, discountDuration, image, images, video, category, featured, order } = body

    if (!name || !description || !price || !image) {
      return NextResponse.json(
        { error: 'Name, description, price, and image are required' },
        { status: 400 }
      )
    }

    // Auto-derive onSale and discountPrice from discountPercent
    const hasDiscount = discountPercent && discountPercent > 0
    const numPrice = parseFloat(String(price).replace(/[^0-9.]/g, ''))
    const derivedDiscountPrice = hasDiscount && numPrice > 0
      ? 'Rs ' + Math.round(numPrice * (1 - discountPercent / 100)).toLocaleString('en-PK')
      : ''

    // Calculate discount expiry time
    let discountExpiresAt = null
    if (hasDiscount && discountDuration && discountDuration > 0) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + discountDuration)
      discountExpiresAt = expiry.toISOString()
    }

    const product = await db.product.create({
      data: {
        name,
        description,
        price,
        discountPrice: derivedDiscountPrice || discountPrice || '',
        onSale: hasDiscount ? true : (onSale ?? false),
        discountPercent: discountPercent ?? 0,
        discountExpiresAt,
        image,
        images: images || '[]',
        video: video || null,
        category: category || 'Vanities',
        featured: featured ?? true,
        order: order ?? 0,
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
