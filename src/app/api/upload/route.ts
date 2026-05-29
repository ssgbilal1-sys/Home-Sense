import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const ext = path.extname(file.name) || '.png'
    const filename = `${uuidv4()}${ext}`
    const filepath = path.join(process.cwd(), 'public', 'products', filename)

    // Ensure directory exists
    const dir = path.join(process.cwd(), 'public', 'products')
    const { mkdir } = await import('fs/promises')
    await mkdir(dir, { recursive: true })

    await writeFile(filepath, buffer)

    return NextResponse.json({
      url: `/products/${filename}`,
      filename
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
