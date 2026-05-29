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
    const { name, description, price, image, images, video, category, featured, order } = body

    if (!name || !description || !price || !image) {
      return NextResponse.json(
        { error: 'Name, description, price, and image are required' },
        { status: 400 }
      )
    }

    const product = await db.product.create({
      data: {
        name,
        description,
        price,
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
