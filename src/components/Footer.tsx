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
  tiktok: string
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
    tiktok: '',
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
            {settings.tiktok && (
              <a
                href={settings.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            )}
            <span className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} Home Sense</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
