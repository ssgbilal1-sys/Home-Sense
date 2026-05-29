import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Check if products already exist
    const existing = await db.product.count()
    if (existing > 0) {
      return NextResponse.json({ message: 'Products already seeded', count: existing })
    }

    // Seed demo products
    const products = await db.product.createMany({
      data: [
        {
          name: 'Zilver Royal Watch',
          description: 'Premium silver luxury timepiece with Swiss movement, sapphire crystal glass, and genuine leather strap. A statement of elegance and precision.',
          price: 'Rs. 25,000',
          image: '/products/watch.png',
          category: 'Watches',
          featured: true,
          order: 1,
        },
        {
          name: 'Zilver Charm Bracelet',
          description: 'Handcrafted sterling silver bracelet with delicate charm detailing. Perfect for everyday elegance or special occasions.',
          price: 'Rs. 12,500',
          image: '/products/bracelet.png',
          category: 'Bracelets',
          featured: true,
          order: 2,
        },
        {
          name: 'Zilver Chain Necklace',
          description: 'Elegant silver chain necklace with premium finish, adjustable length, and secure clasp. A timeless addition to any collection.',
          price: 'Rs. 18,000',
          image: '/products/necklace.png',
          category: 'Necklaces',
          featured: true,
          order: 3,
        },
        {
          name: 'Zilver Gemstone Ring',
          description: 'Stunning silver ring featuring a brilliant gemstone set in sterling silver. Available in multiple sizes for the perfect fit.',
          price: 'Rs. 9,500',
          image: '/products/ring.png',
          category: 'Rings',
          featured: true,
          order: 4,
        },
      ]
    })

    return NextResponse.json({ message: 'Products seeded successfully', count: products.count })
  } catch (error) {
    console.error('Error seeding products:', error)
    return NextResponse.json({ error: 'Failed to seed products' }, { status: 500 })
  }
}
