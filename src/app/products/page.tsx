'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets, Phone, Star, CheckCircle, Package, Play,
  ChevronLeft, ImageIcon, MessageCircle, Wrench, Bath,
  Eye, Percent
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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

const PREDEFINED_CATEGORIES = [
  { name: 'Vanities', icon: Bath, isPrimary: true },
  { name: 'Commode', icon: Package, isPrimary: false },
  { name: 'Basin', icon: Bath, isPrimary: false },
  { name: 'Shower Sets', icon: Droplets, isPrimary: false },
  { name: 'Art Bowls', icon: Star, isPrimary: false },
]

const springTransition = { type: 'spring' as const, stiffness: 100, damping: 15 }

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

const calcDiscountedPrice = (priceStr: string, percent: number): string => {
  if (!percent || percent <= 0) return priceStr
  const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''))
  if (isNaN(num) || num <= 0) return priceStr
  const discounted = Math.round(num * (1 - percent / 100))
  const prefix = priceStr.match(/^[^0-9]*/)?.[0] || ''
  return prefix + discounted.toLocaleString('en-PK')
}

const getProductImages = (product: Product): string[] => {
  try {
    const parsed = JSON.parse(product.images || '[]')
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {}
  return product.image ? [product.image] : []
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<SiteSettings>({
    phone: '', whatsapp: '', email: '', instagram: '', facebook: '', youtube: '',
    address: '', businessHours: '', mapUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [detailImageIndex, setDetailImageIndex] = useState(0)
  const [detailImageKey, setDetailImageKey] = useState(0)

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
  }, [products, selectedCategory])

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

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) setSettings(await res.json())
    } catch {}
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const filteredProducts = useMemo(() =>
    products.filter(p => !selectedCategory || p.category.toLowerCase() === selectedCategory.toLowerCase()),
    [products, selectedCategory]
  )

  const categoryCounts = useMemo(() =>
    products.reduce((acc, p) => { const key = p.category.trim(); acc[key] = (acc[key] || 0) + 1; return acc }, {} as Record<string, number>),
    [products]
  )

  const getCategoryCount = (catName: string): number => {
    const lower = catName.toLowerCase().trim()
    return Object.entries(categoryCounts).reduce((total, [key, count]) =>
      key.toLowerCase().trim() === lower ? total + count : total, 0)
  }

  const CATEGORIES = useMemo(() => {
    const dbCategoryNames = [...new Set(products.map(p => p.category))]
    const customCategoryNames = dbCategoryNames.filter(
      name => !PREDEFINED_CATEGORIES.some(c => c.name.toLowerCase() === name.toLowerCase())
    )
    return [
      ...PREDEFINED_CATEGORIES,
      ...customCategoryNames.map(name => ({ name, icon: Droplets, isPrimary: false })),
    ]
  }, [products])

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
          >✕</button>

          <div className="grid lg:grid-cols-2 gap-0">
            <div className="p-6">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-black/30 mb-4">
                <AnimatePresence mode="wait">
                  {selectedProduct.video && detailImageIndex === -1 ? (
                    <motion.video key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      src={selectedProduct.video} controls autoPlay className="w-full h-full object-contain" poster={selectedProduct.image} />
                  ) : (
                    <motion.img key={detailImageKey} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      src={displayImages[detailImageIndex >= 0 ? detailImageIndex : 0] || selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  )}
                </AnimatePresence>
                {displayImages.length > 1 && detailImageIndex >= 0 && (
                  <>
                    <button onClick={() => { setDetailImageIndex((detailImageIndex - 1 + displayImages.length) % displayImages.length); setDetailImageKey(p => p + 1) }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => { setDetailImageIndex((detailImageIndex + 1) % displayImages.length); setDetailImageKey(p => p + 1) }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 rotate-180">
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
                  <button key={i} onClick={() => { setDetailImageIndex(i); setDetailImageKey(p => p + 1) }}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${detailImageIndex === i ? 'border-sky-400 ring-1 ring-sky-400/50' : 'border-white/10 hover:border-white/30'}`}>
                    <img src={img} alt={`${selectedProduct.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                {selectedProduct.video && (
                  <button onClick={() => setDetailImageIndex(-1)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all relative hover:scale-105 ${detailImageIndex === -1 ? 'border-red-400 ring-1 ring-red-400/50' : 'border-white/10 hover:border-red-400/50'}`}>
                    <img src={selectedProduct.image} alt="Video" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center"><Play className="w-6 h-6 text-white fill-white" /></div>
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 lg:p-8 flex flex-col justify-center">
              <div className="mb-4">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium text-white flex items-center gap-1.5 w-fit ${
                  isPrimaryCategory(selectedProduct.category) ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 shadow-lg shadow-amber-500/30' : 'bg-gradient-to-r from-sky-700/80 to-sky-500/80'
                }`}>
                  {(() => { const Icon = getCategoryIcon(selectedProduct.category); return <Icon className="w-3.5 h-3.5" /> })()}
                  {selectedProduct.category}
                  {isPrimaryCategory(selectedProduct.category) && <><Star className="w-3 h-3 fill-amber-200" /><span className="text-[10px] text-amber-100/80 ml-1">Manufactured by Us</span></>}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">{selectedProduct.name}</h2>
              <p className="text-gray-400 text-base mb-6 leading-relaxed">{selectedProduct.description}</p>
              <div className="mb-6">
                {selectedProduct.discountPercent > 0 ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">{calcDiscountedPrice(selectedProduct.price, selectedProduct.discountPercent)}</span>
                    <span className="text-lg text-gray-500 line-through">{selectedProduct.price}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">-{selectedProduct.discountPercent}%</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent">{selectedProduct.price}</span>
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
                <a href="/contact">
                  <Button size="lg" className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0 shadow-lg shadow-sky-600/25 btn-gradient-shift">
                    <Phone className="w-5 h-5 mr-2" />Get Quote
                  </Button>
                </a>
                <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi Home Sense! 👋\n\nI'm interested in:\n\n📦 *${selectedProduct.name}*\n💰 Price: ${selectedProduct.discountPercent > 0 ? `${calcDiscountedPrice(selectedProduct.price, selectedProduct.discountPercent)} (${selectedProduct.discountPercent}% OFF! Was ${selectedProduct.price})` : selectedProduct.price}\n📂 Category: ${selectedProduct.category}\n\nPlease share more details. Thank you!`)}`} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-400">
                    <MessageCircle className="w-5 h-5 mr-2" />WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="overflow-x-hidden">
      {/* Products Section */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-reveal text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Our
              <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent" style={{ backgroundSize: '200% auto' }}> Products</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover our premium collection of vanities, commodes, basins, shower sets, and art bowls. Factory-direct vanities manufactured by us, plus the finest products — all available at Home Sense.
            </p>
            {selectedCategory && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-sm text-gray-400">Showing:</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                  isPrimaryCategory(selectedCategory)
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                }`}>
                  {(() => { const Icon = getCategoryIcon(selectedCategory); return <Icon className="w-3.5 h-3.5" /> })()}
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory(null)} className="ml-1 hover:text-white transition-colors">×</button>
                </span>
              </div>
            )}
          </div>

          {/* Category Quick Links */}
          <div className="mb-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {CATEGORIES.filter(cat => (getCategoryCount(cat.name) || 0) > 0).map((cat, i) => (
                <div key={i} className={`scroll-reveal scroll-reveal-delay-${Math.min(i + 1, 4)}`}>
                  <div onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)} className="group cursor-pointer">
                    <div className={`rounded-xl transition-all duration-300 p-5 text-center card-shine ${
                      selectedCategory === cat.name
                        ? cat.isPrimary
                          ? 'border-2 border-amber-400 bg-gradient-to-b from-amber-500/20 to-amber-500/5 shadow-lg shadow-amber-500/20'
                          : 'border-2 border-sky-400 bg-gradient-to-b from-sky-500/20 to-sky-500/5 shadow-lg shadow-sky-500/20'
                        : cat.isPrimary
                          ? 'border-2 border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent hover:border-amber-400/70'
                          : 'border border-white/8 bg-white/3 hover:bg-white/5 hover:border-sky-600/30'
                    }`}>
                      <cat.icon className={`w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform ${
                        selectedCategory === cat.name ? (cat.isPrimary ? 'text-amber-300' : 'text-sky-300') : (cat.isPrimary ? 'text-amber-400' : 'text-sky-400')
                      }`} />
                      <h3 className={`font-semibold text-sm mb-1 ${selectedCategory === cat.name ? (cat.isPrimary ? 'text-amber-200' : 'text-sky-200') : (cat.isPrimary ? 'text-amber-300' : 'text-white')}`}>{cat.name}</h3>
                      <span className="text-xs text-gray-500">{getCategoryCount(cat.name)} Products</span>
                      {cat.isPrimary && (
                        <div className="mt-2 flex items-center justify-center gap-1">
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">Manufactured by Us</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vanities Manufacturer Banner */}
          {filteredProducts.some(p => isPrimaryCategory(p.category)) && (
            <div className="scroll-reveal mb-10">
              <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 p-6 sm:p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px]" />
                <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                    <Star className="w-7 h-7 text-white fill-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-amber-300 mb-1">Vanities — Manufactured by Us</h3>
                    <p className="text-gray-400 text-sm max-w-xl">We design and manufacture every vanity in-house — ensuring premium quality, custom options, and factory-direct pricing.</p>
                  </div>
                  <span className="shrink-0 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium">Direct from Factory</span>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white/5 border border-white/8">
                  <div className="aspect-square skeleton-shimmer" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-3/4 rounded skeleton-shimmer" />
                    <div className="h-4 w-full rounded skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div key={selectedCategory || 'all'} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {filteredProducts.map((product, index) => {
                const productImages = getProductImages(product)
                const totalImages = productImages.length + (product.video ? 1 : 0)
                return (
                  <div key={product.id} className={`scroll-reveal scroll-reveal-delay-${Math.min((index % 4) + 1, 4)}`}>
                    <div
                      className="product-card group relative rounded-2xl overflow-hidden bg-white/5 border border-white/8 hover:border-sky-600/40 transition-all duration-500 cursor-pointer card-shine"
                      onClick={() => { setSelectedProduct(product); setDetailImageIndex(0); setDetailImageKey(p => p + 1) }}
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img src={product.image} alt={product.name} loading="lazy" className="product-card-img w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1 ${
                            isPrimaryCategory(product.category) ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 shadow-lg shadow-amber-500/30' : 'bg-gradient-to-r from-sky-700/80 to-sky-500/80'
                          }`}>
                            {(() => { const Icon = getCategoryIcon(product.category); return <Icon className="w-3 h-3" /> })()}
                            {product.category}
                            {isPrimaryCategory(product.category) && <Star className="w-3 h-3 ml-0.5 fill-amber-200" />}
                          </span>
                        </div>
                        {product.discountPercent > 0 && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg shadow-red-500/40 flex items-center gap-1 animate-pulse">
                              <Percent className="w-3 h-3" />{product.discountPercent}% OFF
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
                                <span className="text-lg font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">{calcDiscountedPrice(product.price, product.discountPercent)}</span>
                                <span className="text-sm text-gray-500 line-through">{product.price}</span>
                                <span className="text-[10px] font-bold text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded-full">-{product.discountPercent}%</span>
                              </>
                            ) : (
                              <span className="text-lg font-bold bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent">{product.price}</span>
                            )}
                          </div>
                          <Button size="sm" className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0 shadow-md shadow-sky-600/20 btn-gradient-shift"
                            onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setDetailImageIndex(0); setDetailImageKey(p => p + 1) }}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-4">No products in &quot;{selectedCategory}&quot; category yet.</p>
                  <button onClick={() => setSelectedCategory(null)} className="px-4 py-2 rounded-lg bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600/30 transition-colors text-sm">
                    Show All Products
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Product Detail Overlay */}
      <AnimatePresence>
        {selectedProduct && renderProductDetail()}
      </AnimatePresence>
    </div>
  )
}
