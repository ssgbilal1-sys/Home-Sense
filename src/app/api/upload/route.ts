import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { verifyAdmin } from '@/lib/auth'

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB for videos

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

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

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'png')
    const safeExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'mov', 'avi']
    const safeExt = safeExtensions.includes(ext) ? ext : 'bin'
    const filename = `${uuidv4()}.${safeExt}`
    const storagePath = isVideo ? `videos/${filename}` : `images/${filename}`

    // Upload to Supabase Storage
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.storage
      .from('products')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: 'Failed to upload file to storage: ' + error.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(storagePath)

    return NextResponse.json({
      url: urlData.publicUrl,
      filename,
      type: isVideo ? 'video' : 'image',
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
