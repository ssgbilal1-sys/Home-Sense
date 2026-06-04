'use client'

import { useEffect, useState } from 'react'
import {
  Droplets, Phone, MessageCircle, Star, CheckCircle,
  Wrench, ChevronLeft, Bath, Package,
  Tag, Send, Loader2, ArrowLeft, Percent, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  description: string
  price: string
  discountPrice: string
  onSale: boolean
  discountPercent: number
  discountExpiresAt: string | null
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
  tiktok: string
  address: string
}

interface ProductReview {
  id: string
  productId: string
  name: string
  rating: number
  comment: string
  approved: boolean
  createdAt: string
}

export default function ProductDetailClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [settings, setSettings] = useState<SiteSettings>({
    phone: '', whatsapp: '', email: '', instagram: '', facebook: '', youtube: '', tiktok: '', address: ''
  })
  const [loading, setLoading] = useState(true)
  const [imageIndex, setImageIndex] = useState(0)

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const { toast } = useToast()

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

  // Fetch product reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/product-reviews?productId=${productId}`)
        if (res.ok) {
          setReviews(await res.json())
        }
      } catch (e) {
        console.error('Error fetching reviews:', e)
      }
    }
    fetchReviews()
  }, [productId])

  // Submit review
  const handleSubmitReview = async () => {
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast({ title: 'Missing Fields', description: 'Please enter your name and review.', variant: 'destructive' })
      return
    }
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/product-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, name: reviewName, rating: reviewRating, comment: reviewComment }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Review Submitted!', description: 'Thank you! Your review will appear after approval.' })
        setReviewName('')
        setReviewRating(5)
        setReviewComment('')
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to submit review.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to submit review.', variant: 'destructive' })
    } finally {
      setSubmittingReview(false)
    }
  }

  // Average rating
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  const getProductImages = (): string[] => {
    if (!product) return []
    try {
      const parsed = JSON.parse(product.images || '[]')
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Put profile image first, then other images (avoid duplicates)
        const profileImage = product.image
        const otherImages = parsed.filter((img: string) => {
          const imgBase = img.split('?')[0]
          const profileBase = profileImage?.split('?')[0]
          return imgBase !== profileBase
        })
        return profileImage ? [profileImage, ...otherImages] : otherImages
      }
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

  // Calculate discounted price from percentage
  const calcDiscountedPrice = (priceStr: string, percent: number): string => {
    if (!percent || percent <= 0) return priceStr
    const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''))
    if (isNaN(num) || num <= 0) return priceStr
    const discounted = Math.round(num * (1 - percent / 100))
    const prefix = priceStr.match(/^[^0-9]*/)?.[0] || ''
    return prefix + discounted.toLocaleString('en-PK')
  }

  // Get remaining time for discount
  const getDiscountTimeLeft = (expiresAt: string | null): string | null => {
    if (!expiresAt) return null
    const diffMs = new Date(expiresAt).getTime() - Date.now()
    if (diffMs <= 0) return null
    const d = Math.floor(diffMs / 86400000)
    const h = Math.floor((diffMs % 86400000) / 3600000)
    const m = Math.floor((diffMs % 3600000) / 60000)
    if (d > 0) return `${d} day${d > 1 ? 's' : ''} ${h}h left`
    if (h > 0) return `${h}h ${m}m left`
    return `${m} min${m > 1 ? 's' : ''} left`
  }

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
    <div>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Back button + Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <a href="/products" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors mb-3 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </a>
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
              <a href="/products" itemProp="item" className="hover:text-sky-400 transition-colors">
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
              {/* SALE badge on image */}
              {product.discountPercent > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-red-500 text-white shadow-lg shadow-red-500/40 flex items-center gap-1.5 animate-pulse">
                    <Percent className="w-4 h-4" />
                    {product.discountPercent}% OFF
                  </span>
                  {product.discountExpiresAt && getDiscountTimeLeft(product.discountExpiresAt) && (
                    <span className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/90 text-white flex items-center gap-1.5 shadow-lg shadow-amber-500/30">
                      <Clock className="w-3 h-3" />
                      {getDiscountTimeLeft(product.discountExpiresAt)}
                    </span>
                  )}
                </div>
              )}
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

            <div className="text-4xl font-bold mb-8">
              {product.discountPercent > 0 ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                    {calcDiscountedPrice(product.price, product.discountPercent)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {product.price}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    -{product.discountPercent}%
                  </span>
                  {product.discountExpiresAt && getDiscountTimeLeft(product.discountExpiresAt) && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getDiscountTimeLeft(product.discountExpiresAt)}
                    </span>
                  )}
                </div>
              ) : (
                <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent">
                  {product.price}
                </span>
              )}
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
              <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi Home Sense! 👋\n\nI'm interested in:\n\n📦 *${product.name}*\n💰 Price: ${product.discountPercent > 0 ? `${calcDiscountedPrice(product.price, product.discountPercent)} (${product.discountPercent}% OFF! Was ${product.price})` : product.price}\n📂 Category: ${product.category}\n\nPlease share more details. Thank you!`)}`} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-400 w-full sm:w-auto">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8">
            {/* Reviews Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Customer Reviews</h2>
                <div className="flex items-center gap-2 mt-1">
                  {reviews.length > 0 ? (
                    <>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-400">{avgRating.toFixed(1)} out of 5</span>
                      <span className="text-xs text-gray-500">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">No reviews yet. Be the first to review!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Existing Reviews */}
            {reviews.length > 0 && (
              <div className="space-y-4 mb-8">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-white/8 bg-white/3 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-600/30 to-sky-400/30 border border-sky-500/20 flex items-center justify-center text-sm font-bold text-sky-300">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{review.name}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed ml-12">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Write a Review Form */}
            <div className="border-t border-white/8 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
              <div className="space-y-4">
                {/* Star Rating */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Your Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star className={`w-7 h-7 transition-colors ${(hoverRating || reviewRating) >= s ? 'text-amber-400 fill-amber-400' : 'text-gray-600 hover:text-amber-400/50'}`} />
                      </button>
                    ))}
                    <span className="text-sm text-gray-400 ml-2">{reviewRating}/5</span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Your Name</label>
                  <Input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Your Review</label>
                  <Textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500 min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0"
                >
                  {submittingReview ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>


    </div>
  )
}
