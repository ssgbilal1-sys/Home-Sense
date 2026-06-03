'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Menu, X, Shield, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ChevronRight } from 'lucide-react'

interface NavbarProps {
  onAdminLogin?: () => void
}

export default function Navbar({ onAdminLogin }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const pathname = usePathname()
  const { toast } = useToast()

  // Check if already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify')
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated) {
            setIsAdminAuthenticated(true)
          }
        }
      } catch {}
    }
    checkAuth()
  }, [])

  const handleAdminLogin = async () => {
    if (!adminPassword.trim()) {
      toast({ title: 'Empty Password', description: 'Please enter the admin password.', variant: 'destructive' })
      return
    }
    setLoginLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setIsAdminAuthenticated(true)
        setShowAdminLogin(false)
        setAdminPassword('')
        toast({ title: 'Welcome Admin!', description: 'You are now securely logged in. Session expires in 24 hours.' })
        // Navigate to admin page
        window.location.href = '/admin'
      } else {
        if (data.locked) {
          toast({ title: 'Account Locked', description: data.error, variant: 'destructive' })
        } else {
          const remaining = data.attemptsLeft !== undefined ? ` ${data.attemptsLeft} attempt(s) remaining.` : ''
          toast({ title: 'Invalid Credentials', description: `Wrong password.${remaining}`, variant: 'destructive' })
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({ title: 'Connection Error', description: 'Could not connect to server. Please try again.', variant: 'destructive' })
    } finally {
      setLoginLoading(false)
    }
  }

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'Contact', href: '/contact' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav className="relative z-50 border-b border-white/8 bg-[#080c14]/95 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer">
              <div>
                <img
                  src="/logo-homesense.jpg"
                  alt="Home Sense"
                  loading="lazy"
                  className="h-10 sm:h-12 w-auto object-contain rounded-lg"
                />
              </div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-wider">
                <span
                  className="bg-gradient-to-r from-sky-400 via-sky-300 to-sky-500 bg-clip-text text-transparent"
                  style={{ backgroundSize: '200% auto' }}
                >
                  HOME
                </span>
                <span className="text-white">
                  {' '}SENSE
                </span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm transition-colors nav-link ${
                    isActive(link.href)
                      ? 'text-white font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div>
                <Button
                  onClick={() => {
                    if (isAdminAuthenticated) {
                      window.location.href = '/admin'
                    } else {
                      setShowAdminLogin(true)
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="border-white/15 text-gray-300 hover:text-white hover:border-sky-500 hover:bg-sky-600/10"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Admin
                </Button>
              </div>
            </div>

            {/* Mobile buttons */}
            <div className="flex items-center gap-2 md:hidden">
              <Button
                onClick={() => {
                  if (isAdminAuthenticated) {
                    window.location.href = '/admin'
                  } else {
                    setShowAdminLogin(true)
                  }
                }}
                variant="ghost" size="icon" className="text-gray-300"
              >
                <Shield className="w-5 h-5" />
              </Button>
              <Button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} variant="ghost" size="icon" className="text-gray-300">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="md:hidden border-t border-white/8 bg-[#080c14]/98 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 px-3 rounded-lg transition-colors ${
                      isActive(link.href)
                        ? 'text-white font-semibold bg-white/5'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Admin Login Dialog */}
      <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
        <DialogContent className="bg-[#0d1220] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-500" />
              Admin Access
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the admin password to manage your Home Sense store.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Password</Label>
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="Enter admin password"
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-600 focus:ring-sky-600/20"
              />
            </div>
            <p className="text-xs text-gray-500">
              <span className="text-gray-500">Session expires in 24 hours</span>
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleAdminLogin} disabled={loginLoading} className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0">
              {loginLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ChevronRight className="w-4 h-4 mr-1" />}
              {loginLoading ? 'Verifying...' : 'Login'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
