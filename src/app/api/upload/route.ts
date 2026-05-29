import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { verifyAdmin } from '@/lib/auth'

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB for videos

// POST upload file (ADMIN ONLY)
export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const auth = await verifyAdmin()
    if (!auth.authenticated) return auth.response!

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 100MB.' }, { status: 400 })
    }

    // Validate file type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG, MP4, WebM, MOV, AVI.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename with sanitized extension
    const ext = path.extname(file.name).toLowerCase() || (isVideo ? '.mp4' : '.png')
    const safeExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm', '.mov', '.avi']
    const safeExt = safeExtensions.includes(ext) ? ext : '.bin'
    const filename = `${uuidv4()}${safeExt}`

    // Ensure the path stays within public/products
    const dir = path.join(process.cwd(), 'public', 'products')
    const { mkdir } = await import('fs/promises')
    await mkdir(dir, { recursive: true })

    const filepath = path.join(dir, filename)

    // Security check: ensure filepath is within the expected directory
    if (!filepath.startsWith(path.join(process.cwd(), 'public'))) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    await writeFile(filepath, buffer)

    return NextResponse.json({
      url: `/products/${filename}`,
      filename,
      type: isVideo ? 'video' : 'image',
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
