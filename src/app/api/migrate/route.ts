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

    // Add discountPrice column to Product if not exists
    await pool.query(`
      ALTER TABLE "Product"
      ADD COLUMN IF NOT EXISTS "discountPrice" TEXT NOT NULL DEFAULT '';
    `)

    // Add onSale column to Product if not exists
    await pool.query(`
      ALTER TABLE "Product"
      ADD COLUMN IF NOT EXISTS "onSale" BOOLEAN NOT NULL DEFAULT false;
    `)

    // Create Review table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Review" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "rating" INTEGER NOT NULL DEFAULT 5,
        "comment" TEXT NOT NULL,
        "date" TEXT NOT NULL DEFAULT '',
        "approved" BOOLEAN NOT NULL DEFAULT true,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
      );
    `)

    // Ensure RLS policies allow service role access on Review table
    // Disable RLS on Review table since we use service_role key (bypasses RLS)
    // But if RLS is on and no policies exist, even service_role inserts could fail
    try {
      await pool.query(`ALTER TABLE "Review" DISABLE ROW LEVEL SECURITY;`)
    } catch {
      // RLS might already be disabled, ignore error
    }

    // Add discountPercent column to Product if not exists
    await pool.query(`
      ALTER TABLE "Product"
      ADD COLUMN IF NOT EXISTS "discountPercent" INTEGER NOT NULL DEFAULT 0;
    `)

    return NextResponse.json({
      success: true,
      message: 'Migration completed: businessHours, mapUrl columns added to SiteSettings; discountPrice, onSale, discountPercent columns added to Product; Review table created.',
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
