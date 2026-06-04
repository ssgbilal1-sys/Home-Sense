// Fix existing products: derive onSale and discountPrice from discountPercent
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://db.gfvggrjplvzhrenixdfr.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_KEY) {
  console.error('Need SUPABASE_SERVICE_ROLE_KEY env var')
  process.exit(1)
}

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function fixDiscounts() {
  const { data: products, error } = await supabase.from('Product').select('*')
  if (error) { console.error('Fetch error:', error); process.exit(1) }
  
  console.log(`Found ${products.length} products`)
  
  for (const p of products) {
    const hasDiscount = p.discountPercent && p.discountPercent > 0
    const numPrice = parseFloat(String(p.price).replace(/[^0-9.]/g, ''))
    const derivedDiscountPrice = hasDiscount && numPrice > 0
      ? 'Rs ' + Math.round(numPrice * (1 - p.discountPercent / 100)).toLocaleString('en-PK')
      : ''
    const derivedOnSale = hasDiscount
    
    if (p.onSale !== derivedOnSale || p.discountPrice !== derivedDiscountPrice) {
      console.log(`Fixing "${p.name}": discountPercent=${p.discountPercent}, onSale=${p.onSale}->${derivedOnSale}, discountPrice="${p.discountPrice}"->"${derivedDiscountPrice}"`)
      
      const { error: updateError } = await supabase
        .from('Product')
        .update({ onSale: derivedOnSale, discountPrice: derivedDiscountPrice, updatedAt: new Date().toISOString() })
        .eq('id', p.id)
      
      if (updateError) console.error(`  Error: ${updateError.message}`)
      else console.log(`  ✓ Fixed!`)
    } else {
      console.log(`"${p.name}": already correct (discountPercent=${p.discountPercent})`)
    }
  }
  
  console.log('\nDone!')
}

fixDiscounts()
