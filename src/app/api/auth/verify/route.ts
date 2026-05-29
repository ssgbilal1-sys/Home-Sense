import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('zilver-admin-token')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)

    try {
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ['HS256'],
      })

      return NextResponse.json({
        authenticated: true,
        role: payload.role,
        expiresAt: payload.exp,
      })
    } catch {
      // Token expired or invalid
      const cookieStore2 = await cookies()
      cookieStore2.delete('zilver-admin-token')
      return NextResponse.json({ authenticated: false, error: 'Token expired' }, { status: 401 })
    }
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
