import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/settings — Fetch site settings
export async function GET() {
  try {
    let settings = await db.siteSettings.findUnique({ where: { id: 'main' } })
    if (!settings) {
      // Create default settings if not exist
      settings = await db.siteSettings.create({
        data: { id: 'main' }
      })
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT /api/settings — Update site settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    const data: Record<string, string> = {}
    const allowedFields = ['phone', 'whatsapp', 'email', 'instagram', 'facebook', 'youtube', 'address']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = String(body[field])
      }
    }

    const settings = await db.siteSettings.upsert({
      where: { id: 'main' },
      update: data,
      create: { id: 'main', ...data },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
