import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const results: Record<string, string> = {}
  
  // Test current DATABASE_URL
  try {
    const prisma = new PrismaClient()
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } })
    results['current_url'] = 'SUCCESS: ' + JSON.stringify(settings?.phone)
    await prisma.$disconnect()
  } catch (error: any) {
    results['current_url'] = 'ERROR: ' + error.message
  }
  
  // Also show the DATABASE_URL (masked)
  const dbUrl = process.env.DATABASE_URL || 'NOT SET'
  results['db_url_masked'] = dbUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')
  results['direct_url_set'] = process.env.DIRECT_URL ? 'YES' : 'NO'
  results['supabase_url'] = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'
  
  return NextResponse.json(results)
}
