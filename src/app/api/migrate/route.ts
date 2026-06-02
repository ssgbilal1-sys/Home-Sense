import { NextResponse } from 'next/server'
import { Pool } from 'pg'

// POST /api/migrate — One-time migration to add new columns to SiteSettings
export async function POST() {
  // Only allow if DATABASE_URL (direct Postgres) is available
  const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL

  if (!databaseUrl || databaseUrl.startsWith('file:')) {
    return NextResponse.json(
      { error: 'Direct PostgreSQL connection URL (DIRECT_URL) is required for migration. Please add it to your environment variables.' },
      { status: 400 }
    )
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })

  try {
    // Add businessHours column if not exists
    await pool.query(`
      ALTER TABLE "SiteSettings"
      ADD COLUMN IF NOT EXISTS "businessHours" TEXT NOT NULL DEFAULT 'Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed';
    `)

    // Add mapUrl column if not exists
    await pool.query(`
      ALTER TABLE "SiteSettings"
      ADD COLUMN IF NOT EXISTS "mapUrl" TEXT NOT NULL DEFAULT '';
    `)

    return NextResponse.json({
      success: true,
      message: 'Migration completed: businessHours and mapUrl columns added to SiteSettings table.',
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  } finally {
    await pool.end()
  }
}

// GET /api/migrate — Check migration status
export async function GET() {
  const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL

  if (!databaseUrl || databaseUrl.startsWith('file:')) {
    return NextResponse.json({
      status: 'unavailable',
      message: 'Direct PostgreSQL URL not configured. Run migration via Supabase SQL Editor instead.',
      sql: `
-- Run this in Supabase SQL Editor:
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "businessHours" TEXT NOT NULL DEFAULT 'Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "mapUrl" TEXT NOT NULL DEFAULT '';
`
    })
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })

  try {
    const result = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'SiteSettings' AND column_name IN ('businessHours', 'mapUrl');
    `)

    const columns = result.rows.map((r: any) => r.column_name)
    return NextResponse.json({
      status: columns.length === 2 ? 'migrated' : 'pending',
      businessHours: columns.includes('businessHours'),
      mapUrl: columns.includes('mapUrl'),
    })
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
  } finally {
    await pool.end()
  }
}
