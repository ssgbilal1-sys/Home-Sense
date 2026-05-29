import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const results: Record<string, any> = {}

  try {
    const settings = await db.siteSettings.findUnique({ where: { id: 'main' } })
    results['settings'] = settings ? 'SUCCESS: ' + settings.phone : 'No settings found'
  } catch (error: any) {
    results['settings_error'] = error.message
  }

  try {
    const products = await db.product.findMany()
    results['products'] = `SUCCESS: ${products.length} products found`
  } catch (error: any) {
    results['products_error'] = error.message
  }

  return NextResponse.json(results)
}
