'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Droplets, Phone, Mail, MessageCircle, Star, CheckCircle,
  Wrench, ChevronLeft, Play, Menu, X, Bath, Package,
  ArrowRight, Shield, Facebook, Instagram, Youtube, Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  name: string
  description: string
  price: string
  image: string
  images: string
  video: string | null
  category: string
  featured: boolean
  order: number
  createdAt: string
  updatedAt: string
}

interface SiteSettings {
  phone: string
  whatsapp: string
  email: string
  instagram: string
  facebook: string
  youtube: string
  address: string
}

export default function ProductDetailClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [settings, setSettings] = useState<SiteSettings>({
    phone: '', whatsapp: '', email: '', instagram: '', facebook: '', youtube: '', address: ''
  })
  const [loading, setLoading] = useState(true)
  const [imageIndex, setImageIndex] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, settingsRes] = await Promise.all([
          fetch('/api/products/' + productId),
          fetch('/api/settings'),
        ])
        if (productRes.ok) {
          const data = await productRes.json()
          setProduct(data)
        }
        if (settingsRes.ok) {
          setSettings(await settingsRes.json())
        }
      } catch (e) {
        console.error('Error fetching product:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [productId])

  const getProductImages = (): string[] => {
    if (!product) return []
    try {
      const parsed = JSON.parse(product.images || '[]')
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch {}
    return product.image ? [product.image] : []
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'vanities': return Bath
      case 'commode': return Package
      case 'basin': return Bath
      case 'shower sets': return Droplets
      case 'art bowls': return Star
      default: return Droplets
    }
  }

  const isPrimaryCategory = (category: string) => category.toLowerCase() === 'vanities'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">Product Not Found</h1>
        <p className="text-gray-400">The product you are looking for does not exist.</p>
        <a href="/">
          <Button className="bg-gradient-to-r from-sky-700 to-sky-500 text-white border-0">
            ← Back to Home
          </Button>
        </a>
      </div>
    )
  }

  const displayImages = getProductImages()
  const CategoryIcon = getCategoryIcon(product.category)

  // Structured Data for Google Rich Results
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: { '@type': 'Brand', name: 'Zilver' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: product.price.replace(/[^0-9]/g, ''),
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Home Sense' },
    },
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Navigation */}
      <nav className="border-b border-white/8 bg-[#080c14]/95 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <a href="/" className="flex items-center gap-2 sm:gap-3">
              <img src="/logo-homesense.jpg" alt="Home Sense" className="h-10 sm:h-12 w-auto object-contain rounded-lg" />
              <span className="text-xl sm:text-2xl font-extrabold tracking-wider">
                <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-sky-500 bg-clip-text text-transparent">HOME</span>
                <span className="text-white">{' '}SENSE</span>
              </span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/" className="text-sm text-gray-300 hover:text-white transition-colors">Home</a>
              <a href="/#products" className="text-sm text-gray-300 hover:text-white transition-colors">Products</a>
              <a href="/#contact" className="text-sm text-gray-300 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb for SEO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <a href="/" itemProp="item" className="hover:text-sky-400 transition-colors">
                <span itemProp="name">Home</span>
              </a>
              <meta itemProp="position" content="1" />
            </li>
            <span className="text-gray-600">/</span>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <a href={`/#products`} itemProp="item" className="hover:text-sky-400 transition-colors">
                <span itemProp="name">Products</span>
              </a>
              <meta itemProp="position" content="2" />
            </li>
            <span className="text-gray-600">/</span>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span itemProp="name" className="text-sky-400">{product.name}</span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>
      </div>

      {/* Product Detail */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Images */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/30 mb-4">
              <img
                src={displayImages[imageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() => setImageIndex((imageIndex - 1 + displayImages.length) % displayImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setImageIndex((imageIndex + 1) % displayImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors rotate-180"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm">
                    {imageIndex + 1} / {displayImages.length}
                  </div>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {displayImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      imageIndex === i ? 'border-sky-400 ring-1 ring-sky-400/50' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col justify-center">
            {/* Category badge */}
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm text-white flex items-center gap-1.5 w-fit mb-4 ${
              isPrimaryCategory(product.category)
                ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 shadow-lg shadow-amber-500/30'
                : 'bg-gradient-to-r from-sky-700/80 to-sky-500/80'
            }`}>
              <CategoryIcon className="w-3.5 h-3.5" />
              {product.category}
              {isPrimaryCategory(product.category) && (
                <>
                  <Star className="w-3 h-3 fill-amber-200" />
                  <span className="text-[10px] text-amber-100/80 ml-1">Manufactured by Us</span>
                </>
              )}
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">{product.name}</h1>
            <p className="text-gray-400 text-base mb-6 leading-relaxed">{product.description}</p>

            <div className="text-4xl font-bold bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent mb-8">
              {product.price}
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {[
                { icon: CheckCircle, text: 'Premium Quality Materials' },
                { icon: Star, text: 'International Standards Compliant' },
                { icon: Wrench, text: 'Spare Parts Available' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-sky-400 shrink-0" />
                  <span className="text-gray-300 text-sm">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={`tel:${settings.phone}`}>
                <Button size="lg" className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0 shadow-lg shadow-sky-600/25 w-full sm:w-auto">
                  <Phone className="w-5 h-5 mr-2" />
                  Get Quote
                </Button>
              </a>
              <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi Home Sense! 👋\n\nI'm interested in:\n\n📦 *${product.name}*\n💰 Price: ${product.price}\n📂 Category: ${product.category}\n\nPlease share more details. Thank you!`)}`} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-400 w-full sm:w-auto">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/8 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo-homesense.jpg" alt="Home Sense" className="h-12 w-auto object-contain rounded-lg" />
            </a>
            <div className="flex items-center gap-4">
              {[
                { Icon: Facebook, href: settings.facebook || '#' },
                { Icon: Instagram, href: settings.instagram ? `https://instagram.com/${settings.instagram.replace('@', '')}` : '#' },
                { Icon: Youtube, href: settings.youtube || '#' },
              ].filter(s => s.href !== '#').map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300 transition-colors">
                  <social.Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <p className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} Home Sense. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
