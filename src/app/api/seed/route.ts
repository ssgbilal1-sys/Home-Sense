import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Delete existing products first
    await supabase.from('Product').delete().neq('id', '')

    // Seed demo sanitary products one by one
    const demoProducts = [
      {
        name: 'Zilver Art Wash Basin',
        description: 'Upgrading your bathroom is easy with our Zilver contemporary ceramic vessel sink art basin. Beautiful curves and modern simplicity design give your bathroom style and sophistication. Vitreous China White Finish.',
        price: 'Rs. 18,500',
        image: '/products/basin.png',
        category: 'Wash Basins',
        featured: true,
        order: 1,
      },
      {
        name: 'Zilver Basin Mixer',
        description: 'Premium chrome basin mixer with sleek minimalist design. High standard, long life combined with Zilver superior performance. Carefully engineered, all parts complying with international standards.',
        price: 'Rs. 12,000',
        image: '/products/mixer.png',
        category: 'Tap & Mixers',
        featured: true,
        order: 2,
      },
      {
        name: 'Zilver Rain Shower System',
        description: 'Experience luxury with our rain shower system. Modern multifaceted solutions for the contemporary bathroom. Premium chrome finish with adjustable head shower and handheld combination.',
        price: 'Rs. 35,000',
        image: '/products/shower.png',
        category: 'Showers',
        featured: true,
        order: 3,
      },
      {
        name: 'Zilver Wall Hung Commode',
        description: 'Elegant wall-hung commode with contemporary design. White ceramic finish with concealed cistern compatibility. Aesthetically appealing and functional product that matches your taste and lifestyle.',
        price: 'Rs. 28,000',
        image: '/products/commode.png',
        category: 'Commode',
        featured: true,
        order: 4,
      },
    ]

    for (const product of demoProducts) {
      await db.product.create({ data: product })
    }

    return NextResponse.json({ message: 'Products seeded successfully', count: demoProducts.length })
  } catch (error) {
    console.error('Error seeding products:', error)
    return NextResponse.json({ error: 'Failed to seed products' }, { status: 500 })
  }
}
