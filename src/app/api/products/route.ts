import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET all products
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

// POST create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, image, category, featured, order } = body

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
        category: category || 'Jewelry',
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
