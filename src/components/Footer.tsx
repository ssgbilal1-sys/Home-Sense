'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Facebook, Instagram, Youtube
} from 'lucide-react'

interface SiteSettings {
  phone: string
  whatsapp: string
  email: string
  instagram: string
  facebook: string
  youtube: string
  address: string
  businessHours: string
  mapUrl: string
}

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings>({
    phone: '',
    whatsapp: '',
    email: '',
    instagram: '',
    facebook: '',
    youtube: '',
    address: '',
    businessHours: '',
    mapUrl: '',
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(data)
        }
      } catch {}
    }
    fetchSettings()
  }, [])

  return (
    <footer className="relative z-10 border-t border-white/8 py-8 mt-auto scroll-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-homesense.jpg"
              alt="Home Sense"
              loading="lazy"
              className="h-10 w-auto object-contain rounded-lg"
            />
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {settings.phone && (
                <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">{settings.phone}</a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">{settings.email}</a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4 text-xs text-gray-500">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/products" className="hover:text-white transition-colors">Products</Link>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/reviews" className="hover:text-white transition-colors">Reviews</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {[
              { Icon: Facebook, href: settings.facebook || '#' },
              { Icon: Instagram, href: settings.instagram ? `https://instagram.com/${settings.instagram.replace('@', '')}` : '#' },
              { Icon: Youtube, href: settings.youtube || '#' },
            ].filter(s => s.href !== '#').map((social, i) => (
              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <social.Icon className="w-4 h-4" />
              </a>
            ))}
            <span className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} Home Sense</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
