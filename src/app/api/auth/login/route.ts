import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    // Verify password
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials.', attemptsLeft: 4 },
        { status: 401 }
      )
    }

    // Create JWT token using jose
    let token: string
    try {
      const { SignJWT } = await import('jose')
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      token = await new SignJWT({
        role: 'admin',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .setSubject('zilver-admin')
        .sign(secret)
    } catch (jwtError) {
      console.error('JWT signing error:', jwtError)
      return NextResponse.json({ error: 'Authentication service error' }, { status: 500 })
    }

    // Set cookie
    try {
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      cookieStore.set('zilver-admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 60 * 60 * 24,
        path: '/',
      })
    } catch (cookieError) {
      console.error('Cookie setting error:', cookieError)
      // Return token in response body as fallback
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        token: token,
        expiresIn: '24h',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      expiresIn: '24h',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Logout
export async function DELETE() {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.delete('zilver-admin-token')
    return NextResponse.json({ success: true, message: 'Logged out' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
