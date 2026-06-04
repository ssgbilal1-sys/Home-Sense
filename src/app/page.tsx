'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Droplets, Plus, Trash2, Edit3,
  Save, ChevronRight, Phone, Mail,
  ArrowRight, Eye, Settings,
  Star, CheckCircle, Package, Video,
  Play, ChevronLeft, ImageIcon, XCircle,
  Wrench, Bath, MessageCircle, Percent
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatePresence } from 'framer-motion'
import { trackContact, trackViewContent } from '@/lib/pixel'

// Types
interface Product {
  id: string
  name: string
  description: string
  price: string
  discountPercent: number
  image: string
  images: string
  video: string | null
  category: string
  featured: boolean
  order: number
  createdAt: string
  updatedAt: string
}

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  approved: boolean
  order: number
}

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

// ───────────────────────────────────────────────────────
// HERO IMAGES
// ───────────────────────────────────────────────────────
const HERO_IMAGES = [
  '/bathroom-1.jpg',
  '/bathroom-2.jpg',
]

// ───────────────────────────────────────────────────────
// HERO TEXT REVEAL VARIANTS
// ───────────────────────────────────────────────────────
const heroTextVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.15,
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

const springTransition = { type: 'spring' as const, stiffness: 100, damping: 15 }

// Category icons mapping
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

// Calculate discounted price
const calcDiscountedPrice = (priceStr: string, percent: number): string => {
  if (!percent || percent <= 0) return priceStr
  const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''))
  if (isNaN(num) || num <= 0) return priceStr
  const discounted = Math.round(num * (1 - percent / 100))
  const prefix = priceStr.match(/^[^0-9]*/)?.[0] || ''
  return prefix + discounted.toLocaleString('en-PK')
}

// Parse images from product
const getProductImages = (product: Product): string[] => {
  try {
    const parsed = JSON.parse(product.images || '[]')
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {}
  return product.image ? [product.image] : []
}

// ───────────────────────────────────────────────────────
// HERO SLIDESHOW
// ───────────────────────────────────────────────────────
function HeroSlideshow() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute inset-0 z-0">
      {HERO_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="Luxury Bathroom Interior"
          loading={i === 0 ? undefined : 'lazy'}
          className={`hero-slide absolute inset-0 w-full h-full object-cover object-center sm:object-[center_30%] ${i === current ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 sm:hidden bg-gradient-to-t from-[#080c14] via-[#080c14]/60 to-[#080c14]/10" />
      <div className="absolute inset-0 hidden sm:block lg:hidden bg-gradient-to-r from-[#080c14]/85 via-[#080c14]/50 to-[#080c14]/20" />
      <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-[#080c14]/80 via-[#080c14]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-[#080c14] to-transparent" />
      <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-500 ${
              i === current ? 'bg-sky-400 w-6 sm:w-8' : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [settings, setSettings] = useState<SiteSettings>({
    phone: '+92 300 1234567',
    whatsapp: '+92 300 1234567',
    email: 'info@zilver.co',
    instagram: '@zilver.co',
    facebook: '',
    youtube: '',
    tiktok: '',
    address: '',
    businessHours: 'Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed',
    mapUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [detailImageIndex, setDetailImageIndex] = useState(0)
  const [detailImageKey, setDetailImageKey] = useState(0)

  // Scroll-reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [products, reviews])

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews?approved=true')
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }, [])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  // Featured products (only featured ones)
  const featuredProducts = useMemo(() =>
    products.filter(p => p.featured).slice(0, 8),
    [products]
  )

  // Latest reviews (top 3)
  const latestReviews = useMemo(() =>
    reviews.slice(0, 3),
    [reviews]
  )

  // Product detail overlay
  const renderProductDetail = () => {
    if (!selectedProduct) return null
    const allImages = getProductImages(selectedProduct)
    const profileImage = selectedProduct.image
    const otherImages = allImages.filter(img => {
      const imgBase = img.split('?')[0]
      const profileBase = profileImage?.split('?')[0]
      return imgBase !== profileBase
    })
    const displayImages = profileImage ? [profileImage, ...otherImages] : otherImages

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] bg-[#080c14]/98 flex items-center justify-center p-4"
        onClick={() => setSelectedProduct(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={springTransition}
          className="bg-[#0d1220] border border-white/10 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setSelectedProduct(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors hover:scale-110 hover:rotate-90 active:scale-90"
          >
            ✕
          </button>

          <div className="grid lg:grid-cols-2 gap-0">
            <div className="p-6">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-black/30 mb-4">
                <AnimatePresence mode="wait">
                  {selectedProduct.video && detailImageIndex === -1 ? (
                    <motion.video
                      key="video"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      src={selectedProduct.video}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                      poster={selectedProduct.image}
                    />
                  ) : (
                    <motion.img
                      key={detailImageKey}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      src={displayImages[detailImageIndex >= 0 ? detailImageIndex : 0] || selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </AnimatePresence>
                {displayImages.length > 1 && detailImageIndex >= 0 && (
                  <>
                    <button
                      onClick={() => { setDetailImageIndex((detailImageIndex - 1 + displayImages.length) % displayImages.length); setDetailImageKey(prev => prev + 1) }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-all hover:scale-110 active:scale-90"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => { setDetailImageIndex((detailImageIndex + 1) % displayImages.length); setDetailImageKey(prev => prev + 1) }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-all hover:scale-110 active:scale-90 rotate-180"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </>
                )}
                {displayImages.length > 1 && detailImageIndex >= 0 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
                    {detailImageIndex + 1} / {displayImages.length}
                  </div>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {displayImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setDetailImageIndex(i); setDetailImageKey(prev => prev + 1) }}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${
                      detailImageIndex === i ? 'border-sky-400 ring-1 ring-sky-400/50' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img} alt={`${selectedProduct.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                {selectedProduct.video && (
                  <button
                    onClick={() => setDetailImageIndex(-1)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all relative hover:scale-105 active:scale-95 ${
                      detailImageIndex === -1 ? 'border-red-400 ring-1 ring-red-400/50' : 'border-white/10 hover:border-red-400/50'
                    }`}
                  >
                    <img src={selectedProduct.image} alt="Video" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 lg:p-8 flex flex-col justify-center">
              <div className="mb-4">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium text-white flex items-center gap-1.5 w-fit ${
                  isPrimaryCategory(selectedProduct.category)
                    ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 shadow-lg shadow-amber-500/30'
                    : 'bg-gradient-to-r from-sky-700/80 to-sky-500/80'
                }`}>
                  {(() => { const Icon = getCategoryIcon(selectedProduct.category); return <Icon className="w-3.5 h-3.5" /> })()}
                  {selectedProduct.category}
                  {isPrimaryCategory(selectedProduct.category) && (
                    <>
                      <Star className="w-3 h-3 fill-amber-200" />
                      <span className="text-[10px] text-amber-100/80 ml-1">Manufactured by Us</span>
                    </>
                  )}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">{selectedProduct.name}</h2>
              <p className="text-gray-400 text-base mb-6 leading-relaxed">{selectedProduct.description}</p>

              <div className="mb-6">
                {selectedProduct.discountPercent > 0 ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                      {calcDiscountedPrice(selectedProduct.price, selectedProduct.discountPercent)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">{selectedProduct.price}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                      -{selectedProduct.discountPercent}%
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent">
                    {selectedProduct.price}
                  </span>
                )}
              </div>

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

              <div className="flex gap-3">
                <Link href="/contact">
                  <Button size="lg" className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0 shadow-lg shadow-sky-600/25 btn-gradient-shift">
                    <Phone className="w-5 h-5 mr-2" />
                    Get Quote
                  </Button>
                </Link>
                <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi Home Sense! 👋\n\nI'm interested in:\n\n📦 *${selectedProduct.name}*\n💰 Price: ${selectedProduct.discountPercent > 0 ? `${calcDiscountedPrice(selectedProduct.price, selectedProduct.discountPercent)} (${selectedProduct.discountPercent}% OFF! Was ${selectedProduct.price})` : selectedProduct.price}\n📂 Category: ${selectedProduct.category}\n\nPlease share more details. Thank you!`)}`} target="_blank" rel="noopener noreferrer" onClick={() => trackContact('whatsapp_product')}>
                  <Button size="lg" variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-400">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Star rating display
  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
      ))}
    </div>
  )

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex items-center overflow-hidden min-h-[70vh]">
        <HeroSlideshow />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 sm:py-24 lg:py-32 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-end lg:items-center">
            <div>
              <motion.div
                custom={0}
                variants={heroTextVariants}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 mb-4 sm:mb-6"
                style={{ boxShadow: '0 0 20px rgba(56,189,248,0.15)' }}
              >
                <span className="text-[10px] sm:text-sm font-bold bg-gradient-to-r from-sky-400 to-sky-300 bg-clip-text text-transparent">HOME SENSE</span>
                <span className="text-[10px] sm:text-sm text-gray-400 hidden xs:inline">Sanitary Fitting & Ware Showroom</span>
              </motion.div>

              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold leading-snug sm:leading-tight lg:leading-none mb-4 sm:mb-6 [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
                <motion.span custom={1} variants={heroTextVariants} initial="hidden" animate="visible" className="block">Innovative,</motion.span>
                <motion.span custom={2} variants={heroTextVariants} initial="hidden" animate="visible" className="block">
                  <span className="bg-gradient-to-r from-sky-500 via-sky-300 to-sky-400 bg-clip-text text-transparent text-shimmer">Efficient</span>
                </motion.span>
                <motion.span custom={3} variants={heroTextVariants} initial="hidden" animate="visible" className="block">& Elegant</motion.span>
              </h1>

              <motion.p custom={4} variants={heroTextVariants} initial="hidden" animate="visible"
                className="text-sm sm:text-lg lg:text-xl text-gray-300 sm:text-gray-400 mb-5 sm:mb-8 max-w-lg [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]"
              >
                Home Sense brings you premium sanitary wares — vanities manufactured by us, plus the complete range of commodes, basins, shower sets, and art bowls.
              </motion.p>

              <motion.div custom={5} variants={heroTextVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-3 sm:gap-4">
                <Link href="/products">
                  <Button size="default" className="sm:h-12 sm:px-6 bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0 shadow-lg shadow-sky-600/25 btn-gradient-shift text-sm sm:text-base">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    Explore Products
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="default" className="sm:h-12 sm:px-6 border-white/20 text-gray-300 hover:text-white hover:border-white/40 text-sm sm:text-base">
                    Contact Us
                    <ArrowRight className="w-4 h-4 ml-1.5 sm:ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative hidden lg:flex items-center justify-center"
            >
              <div className="relative">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/20">
                  <img src="/logo-homesense.jpg" alt="Home Sense" loading="lazy" className="h-24 w-auto object-contain rounded-lg mx-auto mb-3" />
                  <p className="text-center text-white/90 text-sm font-semibold tracking-wide">Authorized & Trusted Dealer</p>
                </div>
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-sky-700 to-sky-500 rounded-xl p-3 shadow-lg shadow-sky-600/30">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-3 -left-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-3 shadow-lg shadow-amber-500/30">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="wave-divider relative z-10 w-full">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[200%] h-full" preserveAspectRatio="none">
          <path d="M0 30C240 10 480 50 720 30C960 10 1200 50 1440 30C1680 10 1920 50 2160 30C2400 10 2640 50 2880 30V60H0V30Z" fill="rgba(2,132,199,0.03)" />
          <path d="M0 35C240 15 480 55 720 35C960 15 1200 55 1440 35C1680 15 1920 55 2160 35C2400 15 2640 55 2880 35V60H0V35Z" fill="rgba(56,189,248,0.02)" />
        </svg>
      </div>

      {/* Featured Products Section */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-reveal text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Featured
              <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent text-shimmer"> Products</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover our premium collection of vanities, commodes, basins, shower sets, and art bowls.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white/5 border border-white/8">
                  <div className="aspect-square skeleton-shimmer" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-3/4 rounded skeleton-shimmer" />
                    <div className="h-4 w-full rounded skeleton-shimmer" />
                    <div className="h-4 w-2/3 rounded skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {featuredProducts.map((product, index) => {
                const productImages = getProductImages(product)
                const totalImages = productImages.length + (product.video ? 1 : 0)
                return (
                  <div key={product.id} className={`scroll-reveal scroll-reveal-delay-${Math.min((index % 4) + 1, 4)}`}>
                    <div
                      className="product-card group relative rounded-2xl overflow-hidden bg-white/5 border border-white/8 hover:border-sky-600/40 transition-all duration-500 cursor-pointer card-shine"
                      onClick={() => { setSelectedProduct(product); setDetailImageIndex(0); setDetailImageKey(prev => prev + 1); trackViewContent(product.name, product.category, product.price) }}
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img src={product.image} alt={product.name} loading="lazy" className="product-card-img w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1 ${
                            isPrimaryCategory(product.category)
                              ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 shadow-lg shadow-amber-500/30'
                              : 'bg-gradient-to-r from-sky-700/80 to-sky-500/80'
                          }`}>
                            {(() => { const Icon = getCategoryIcon(product.category); return <Icon className="w-3 h-3" /> })()}
                            {product.category}
                            {isPrimaryCategory(product.category) && <Star className="w-3 h-3 ml-0.5 fill-amber-200" />}
                          </span>
                        </div>
                        {product.discountPercent > 0 && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg shadow-red-500/40 flex items-center gap-1 animate-pulse">
                              <Percent className="w-3 h-3" />
                              {product.discountPercent}% OFF
                            </span>
                          </div>
                        )}
                        {totalImages > 1 && (
                          <div className={`absolute right-3 flex gap-1 ${product.discountPercent > 0 ? 'top-12' : 'top-3'}`}>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" /> {productImages.length}
                            </span>
                            {product.video && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/80 text-white flex items-center gap-1">
                                <Play className="w-3 h-3 fill-white" />
                              </span>
                            )}
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="w-14 h-14 rounded-full bg-white/25 flex items-center justify-center border-2 border-white/40">
                            <Eye className="w-7 h-7 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-sky-300 transition-colors duration-300">{product.name}</h3>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {product.discountPercent > 0 ? (
                              <>
                                <span className="text-lg font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                                  {calcDiscountedPrice(product.price, product.discountPercent)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">{product.price}</span>
                                <span className="text-[10px] font-bold text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded-full">-{product.discountPercent}%</span>
                              </>
                            ) : (
                              <span className="text-lg font-bold bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent">{product.price}</span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0 shadow-md shadow-sky-600/20 btn-gradient-shift"
                            onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setDetailImageIndex(0); setDetailImageKey(prev => prev + 1) }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="scroll-reveal text-center mt-10">
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-sky-500/30 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400">
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="wave-divider relative z-10 w-full">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[200%] h-full" preserveAspectRatio="none">
          <path d="M0 30C240 10 480 50 720 30C960 10 1200 50 1440 30C1680 10 1920 50 2160 30C2400 10 2640 50 2880 30V60H0V30Z" fill="rgba(2,132,199,0.03)" />
          <path d="M0 35C240 15 480 55 720 35C960 15 1200 55 1440 35C1680 15 1920 55 2160 35C2400 15 2640 55 2880 35V60H0V35Z" fill="rgba(56,189,248,0.02)" />
        </svg>
      </div>

      {/* About Summary Section */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-reveal">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                All-in-One
                <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent text-shimmer"> Sanitary Wares</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Excellent details, durable components, compatible hardware result in premium quality. As the authorized dealer, Home Sense brings you the finest vanities, commodes, basins, shower sets, and art bowls.
              </p>
              <div className="space-y-6">
                {[
                  { icon: CheckCircle, title: 'Quality Standards', desc: 'Carefully engineered, all parts complying with international standards.' },
                  { icon: Star, title: 'Innovative Design', desc: 'Modern multifaceted solutions with aesthetically appealing products.' },
                  { icon: Wrench, title: 'Spare Parts Available', desc: 'Long-term performance guaranteed with readily available spare parts.' },
                ].map((item, i) => (
                  <div key={i} className={`scroll-reveal scroll-reveal-delay-${i + 1}`}>
                    <div className="flex gap-4 group cursor-default">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-sky-700/20 to-sky-500/20 border border-white/8 flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-sky-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1 group-hover:text-sky-300 transition-colors">{item.title}</h3>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="scroll-reveal mt-8">
                <Link href="/about">
                  <Button variant="outline" className="border-sky-500/30 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400">
                    Learn More About Us
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="scroll-reveal">
              <div className="relative rounded-3xl border border-white/8 overflow-hidden bg-white/3 p-8 sm:p-12">
                <div className="text-center">
                  <div className="mx-auto mb-6">
                    <img src="/logo-homesense.jpg" alt="Home Sense" loading="lazy" className="h-28 w-auto object-contain rounded-xl mx-auto" />
                  </div>
                  <h3 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent mb-2 text-shimmer">
                    HOME SENSE
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">Sanitary Fitting & Ware</p>
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/8 text-[10px] text-gray-400">
                      <CheckCircle className="w-3 h-3 text-sky-400" />
                      Distributed by Home Sense
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="scroll-reveal"><div className="text-center"><div className="text-2xl sm:text-3xl font-bold text-white">50+</div><div className="text-xs text-gray-500 mt-1">Projects</div></div></div>
                    <div className="scroll-reveal scroll-reveal-delay-2"><div className="text-center"><div className="text-2xl sm:text-3xl font-bold text-white">150+</div><div className="text-xs text-gray-500 mt-1">Products</div></div></div>
                    <div className="scroll-reveal scroll-reveal-delay-3"><div className="text-center"><div className="text-2xl sm:text-3xl font-bold text-white">99%</div><div className="text-xs text-gray-500 mt-1">Quality</div></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="wave-divider relative z-10 w-full">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[200%] h-full" preserveAspectRatio="none">
          <path d="M0 30C240 10 480 50 720 30C960 10 1200 50 1440 30C1680 10 1920 50 2160 30C2400 10 2640 50 2880 30V60H0V30Z" fill="rgba(2,132,199,0.03)" />
          <path d="M0 35C240 15 480 55 720 35C960 15 1200 55 1440 35C1680 15 1920 55 2160 35C2400 15 2640 55 2880 35V60H0V35Z" fill="rgba(56,189,248,0.02)" />
        </svg>
      </div>

      {/* Reviews Preview Section */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-reveal text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Customer
              <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent text-shimmer"> Reviews</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              See what our customers have to say about Home Sense.
            </p>
          </div>

          {latestReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {latestReviews.map((review, i) => (
                <div key={review.id} className={`scroll-reveal scroll-reveal-delay-${Math.min(i + 1, 3)}`}>
                  <div className="rounded-2xl border border-white/8 bg-white/3 p-6 card-shine h-full flex flex-col">
                    <div className="mb-3">{renderStars(review.rating)}</div>
                    <p className="text-gray-300 text-sm flex-1 leading-relaxed mb-4">&ldquo;{review.comment}&rdquo;</p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-700/30 to-sky-500/30 border border-white/10 flex items-center justify-center text-sky-400 font-bold text-sm">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white text-sm font-semibold">{review.name}</div>
                        {review.date && <div className="text-gray-500 text-xs">{review.date}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-500">Reviews coming soon!</p>
            </div>
          )}

          <div className="scroll-reveal text-center mt-10">
            <Link href="/reviews">
              <Button size="lg" variant="outline" className="border-sky-500/30 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400">
                See All Reviews
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="wave-divider relative z-10 w-full">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[200%] h-full" preserveAspectRatio="none">
          <path d="M0 30C240 10 480 50 720 30C960 10 1200 50 1440 30C1680 10 1920 50 2160 30C2400 10 2640 50 2880 30V60H0V30Z" fill="rgba(2,132,199,0.03)" />
          <path d="M0 35C240 15 480 55 720 35C960 15 1200 55 1440 35C1680 15 1920 55 2160 35C2400 15 2640 55 2880 35V60H0V35Z" fill="rgba(56,189,248,0.02)" />
        </svg>
      </div>

      {/* Quick Contact CTA */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-reveal rounded-2xl border border-white/8 bg-gradient-to-r from-sky-900/30 via-sky-800/20 to-sky-900/30 p-8 sm:p-12 text-center card-shine">
            <Phone className="w-10 h-10 text-sky-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Ready to Get Started?
            </h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Contact us today for a free quote or visit our showroom to experience our premium collection in person.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0 shadow-lg shadow-sky-600/25 btn-gradient-shift">
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Us
                </Button>
              </Link>
              <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi Home Sense! 👋\n\nI\'m interested in your sanitary ware products. Please share more details. Thank you!')}`} target="_blank" rel="noopener noreferrer" onClick={() => trackContact('whatsapp_home')}>
                <Button size="lg" variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-400">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Overlay */}
      <AnimatePresence>
        {selectedProduct && renderProductDetail()}
      </AnimatePresence>
    </div>
  )
}
