'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Phone, Mail, MessageCircle, Instagram, Facebook, Youtube,
  MapPin, Clock, Navigation, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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

// ───────────────────────────────────────────────────────
// MAP URL PARSER
// ───────────────────────────────────────────────────────
function extractMapCoords(url: string): { lat: number; lng: number } | null {
  if (!url) return null
  try {
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) }
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) }
    const destMatch = url.match(/destination=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (destMatch) return { lat: parseFloat(destMatch[1]), lng: parseFloat(destMatch[2]) }
    const centerMatch = url.match(/center=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (centerMatch) return { lat: parseFloat(centerMatch[1]), lng: parseFloat(centerMatch[2]) }
    const llMatch = url.match(/ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) }
  } catch { /* ignore */ }
  return null
}

function extractPlaceName(url: string): string | null {
  if (!url) return null
  try {
    const placeMatch = url.match(/\/place\/([^\/\?@]+)/)
    if (placeMatch) return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
  } catch { /* ignore */ }
  return null
}

export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    phone: '+92 300 1234567',
    whatsapp: '+92 300 1234567',
    email: 'info@zilver.co',
    instagram: '@zilver.co',
    facebook: '',
    youtube: '',
    address: '',
    businessHours: 'Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed',
    mapUrl: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) setSettings(await res.json())
      } catch {}
    }
    load()
  }, [])

  // Scroll-reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [settings])

  return (
    <div className="overflow-x-hidden">
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-reveal text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Get in
              <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent text-shimmer"> Touch</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Have a question or need a quote? We would love to hear from you.
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div className="scroll-reveal max-w-4xl mx-auto mb-8">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8 card-shine">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { icon: Phone, label: 'Call Us', value: settings.phone, href: `tel:${settings.phone}`, color: 'from-green-500/20 to-green-600/20 border-green-500/20', iconColor: 'text-green-400' },
                  { icon: MessageCircle, label: 'WhatsApp', value: settings.whatsapp, href: `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi Home Sense! 👋\n\nI\'m interested in your sanitary ware products. Please share more details. Thank you!')}`, color: 'from-green-500/20 to-green-600/20 border-green-500/20', iconColor: 'text-green-400' },
                  { icon: Mail, label: 'Email', value: settings.email, href: `mailto:${settings.email}`, color: 'from-sky-500/20 to-sky-700/20 border-sky-500/20 border-sky-500/20', iconColor: 'text-sky-400' },
                  { icon: Instagram, label: 'Instagram', value: settings.instagram, href: `https://instagram.com/${settings.instagram.replace('@', '')}`, color: 'from-pink-500/20 to-purple-600/20 border-pink-500/20', iconColor: 'text-pink-400' },
                  ...(settings.facebook ? [{ icon: Facebook, label: 'Facebook', value: settings.facebook.replace(/https?:\/\/(www\.)?facebook\.com\/?/i, '').replace(/\/$/, '') || 'Facebook Page', href: settings.facebook, color: 'from-sky-600/20 to-sky-800/20 border-sky-600/20', iconColor: 'text-sky-500' }] : []),
                  ...(settings.youtube ? [{ icon: Youtube, label: 'YouTube', value: settings.youtube.replace(/https?:\/\/(www\.)?youtube\.com\/(c\/|@)?/i, '').replace(/\/$/, '') || 'YouTube Channel', href: settings.youtube, color: 'from-red-500/20 to-red-700/20 border-red-500/20', iconColor: 'text-red-400' }] : []),
                ].map((contact, i) => (
                  <a
                    key={i}
                    href={contact.href}
                    target={contact.href.startsWith('http') ? '_blank' : undefined}
                    rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${contact.color} border flex items-center justify-center icon-bounce-hover`}>
                      <contact.icon className={`w-5 h-5 ${contact.iconColor}`} />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-white text-xs">{contact.label}</div>
                      <div className="text-gray-400 text-[11px] mt-0.5 break-all leading-tight max-w-[140px]">{contact.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Visit Our Showroom Section */}
          <div className="scroll-reveal max-w-6xl mx-auto">
            <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden card-shine">
              {/* Showroom Header Banner */}
              <div className="relative bg-gradient-to-r from-sky-900/60 via-sky-800/40 to-sky-900/60 px-6 sm:px-10 py-6 border-b border-white/8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/30 to-sky-700/30 border border-sky-500/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-7 h-7 text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Visit Our
                      <span className="bg-gradient-to-r from-sky-400 to-sky-300 bg-clip-text text-transparent"> Showroom</span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-0.5">Experience our premium collection in person</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left: Address + Business Hours */}
                <div className="p-6 sm:p-8 space-y-6">
                  {settings.address && (
                    <div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm mb-1">Our Address</div>
                          <div className="text-gray-400 text-sm leading-relaxed">{settings.address}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Business Hours */}
                  {(settings.businessHours || 'Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed') && (
                    <div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-700/20 border border-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-4 h-4 text-sky-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-300 text-sm mb-2">Business Hours</div>
                          <div className="space-y-1">
                            {(settings.businessHours || 'Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed').split('|').map((line, i) => {
                              const colonIdx = line.indexOf(':')
                              const [label, time] = colonIdx >= 0 ? [line.substring(0, colonIdx).trim(), line.substring(colonIdx + 1).trim()] : [line.trim(), '']
                              const isClosed = time.toLowerCase() === 'closed'
                              return (
                                <p key={i} className={`text-sm ${isClosed ? 'text-red-400/80' : 'text-gray-400'}`}>
                                  {label}{time ? ': ' : ''}{time}
                                </p>
                              )
                            })}
                          </div>
                          {/* Open/Closed Status */}
                          {(() => {
                            const now = new Date()
                            const day = now.getDay()
                            const hours = now.getHours()
                            const minutes = now.getMinutes()
                            const currentTime = hours * 60 + minutes
                            const hoursStr = settings.businessHours || 'Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed'

                            const lines = hoursStr.split('|').map(l => l.trim()).filter(Boolean)
                            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                            const dayAbbr = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
                            const todayName = dayNames[day]
                            const todayAbbr = dayAbbr[day]

                            let isOpen = false
                            let matchedSpecific = false

                            const parseTimeRange = (timeStr: string): number | null => {
                              const timeParts = timeStr.split(/\s*[-–—]\s*/).map(t => t.trim())
                              if (timeParts.length !== 2) return null
                              const parseTime = (t: string) => {
                                const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
                                if (!match) return -1
                                let h = parseInt(match[1])
                                const m = parseInt(match[2])
                                const ampm = match[3].toUpperCase()
                                if (ampm === 'PM' && h !== 12) h += 12
                                if (ampm === 'AM' && h === 12) h = 0
                                return h * 60 + m
                              }
                              const openTime = parseTime(timeParts[0])
                              const closeTime = parseTime(timeParts[1])
                              if (openTime < 0 || closeTime < 0) return null
                              return (currentTime >= openTime && currentTime < closeTime) ? 1 : 0
                            }

                            for (const line of lines) {
                              const colonIdx = line.indexOf(':')
                              if (colonIdx < 0) continue
                              const dayLabel = line.substring(0, colonIdx).trim().toLowerCase()
                              const timeStr = line.substring(colonIdx + 1).trim()

                              const isSpecificDay = (dayLabel === todayName || dayLabel === todayAbbr)
                              const isRangeMatch = (
                                (dayLabel.includes('mon-sun') && day >= 0 && day <= 6) ||
                                (dayLabel.includes('mon-sat') && day >= 1 && day <= 6) ||
                                (dayLabel.includes('mon-fri') && day >= 1 && day <= 5) ||
                                (dayLabel.includes('every') || dayLabel.includes('daily'))
                              )

                              if (isSpecificDay) {
                                if (timeStr.toLowerCase() === 'closed') { isOpen = false } else { const result = parseTimeRange(timeStr); isOpen = result === 1 }
                                matchedSpecific = true
                                break
                              }
                              if (!matchedSpecific && isRangeMatch) {
                                if (timeStr.toLowerCase() === 'closed') { isOpen = false } else { const result = parseTimeRange(timeStr); isOpen = result === 1 }
                              }
                            }

                            return (
                              <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg ${isOpen ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                                <span className={`text-sm ${isOpen ? 'text-green-400/80' : 'text-red-400/80'}`}>
                                  {isOpen ? 'Currently Open' : 'Currently Closed'}
                                </span>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Get Directions Button */}
                  {(() => {
                    const coords = extractMapCoords(settings.mapUrl || '')
                    const placeName = extractPlaceName(settings.mapUrl || '')
                    const directionsUrl = coords
                      ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
                      : settings.mapUrl
                        ? settings.mapUrl
                        : settings.address
                          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`
                          : ''
                    return directionsUrl ? (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white font-medium text-sm transition-all hover:-translate-y-0.5"
                      >
                        <Navigation className="w-4 h-4" />
                        Get Directions on Google Maps
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    ) : null
                  })()}
                </div>

                {/* Right: Map Embed */}
                <div className="relative min-h-[300px] lg:min-h-[400px] bg-gray-900/50">
                  {(() => {
                    const mapUrl = settings.mapUrl || ''
                    const coords = extractMapCoords(mapUrl)
                    const placeName = extractPlaceName(mapUrl)
                    const directionsUrl = coords
                      ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
                      : mapUrl ? mapUrl : ''

                    let embedSrc = ''
                    if (coords) {
                      const delta = 0.008
                      const bbox = `${coords.lng - delta}%2C${coords.lat - delta}%2C${coords.lng + delta}%2C${coords.lat + delta}`
                      embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`
                    } else if (placeName) {
                      embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&z=15&output=embed`
                    } else if (settings.address) {
                      embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(settings.address)}&z=15&output=embed`
                    }

                    if (!embedSrc) {
                      return (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-3 p-6">
                          <MapPin className="w-12 h-12 opacity-30" />
                          <p className="text-sm text-center">Map will appear here once address is added in admin settings</p>
                        </div>
                      )
                    }

                    return (
                      <>
                        <iframe
                          src={embedSrc}
                          width="100%"
                          height="100%"
                          style={{ border: 0, minHeight: '300px' }}
                          allowFullScreen
                          loading="lazy"
                          title="Home Sense Showroom Location"
                          className="absolute inset-0 w-full h-full"
                        />
                        {directionsUrl && (
                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 z-10 cursor-pointer"
                            title="Click to open directions in Google Maps"
                          >
                            <span className="sr-only">Open directions in Google Maps</span>
                          </a>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
