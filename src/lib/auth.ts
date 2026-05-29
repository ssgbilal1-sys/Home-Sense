import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function verifyAdmin() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('zilver-admin-token')?.value

    if (!token) {
      return { authenticated: false, response: NextResponse.json({ error: 'Unauthorized - Please login first' }, { status: 401 }) }
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)

    try {
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ['HS256'],
      })

      if (payload.role !== 'admin') {
        return { authenticated: false, response: NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 }) }
      }

      return { authenticated: true, payload }
    } catch {
      return { authenticated: false, response: NextResponse.json({ error: 'Session expired - Please login again' }, { status: 401 }) }
    }
  } catch (error) {
    console.error('Auth verify error:', error)
    return { authenticated: false, response: NextResponse.json({ error: 'Authentication error' }, { status: 500 }) }
  }
}
