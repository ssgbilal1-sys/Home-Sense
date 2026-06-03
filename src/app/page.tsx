'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets, Menu, X, Plus, Trash2, Edit3,
  Upload, Save, ChevronRight, Phone, Mail,
  ArrowRight, Eye, Settings, Shield,
  Facebook, Instagram, Youtube, MessageCircle,
  Wrench, Bath, CookingPot, MapPin,
  Star, CheckCircle, Loader2, Package, Video,
  Play, Film, ChevronLeft, ImageIcon, XCircle,
  Clock, Navigation, ExternalLink, Tag, Percent
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

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

type ViewMode = 'storefront' | 'admin'

// Settings interface
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
// SKELETON LOADING COMPONENT
// ───────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden bg-white/5 border border-white/8">
          <div className="aspect-square skeleton-shimmer" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-3/4 rounded skeleton-shimmer" />
            <div className="h-4 w-full rounded skeleton-shimmer" />
            <div className="h-4 w-2/3 rounded skeleton-shimmer" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 w-20 rounded skeleton-shimmer" />
              <div className="h-9 w-24 rounded-lg skeleton-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ───────────────────────────────────────────────────────
// SPRING TRANSITION PRESETS (outside component)
// ───────────────────────────────────────────────────────
const springTransition = { type: 'spring' as const, stiffness: 100, damping: 15 }
const springBouncy = { type: 'spring' as const, stiffness: 200, damping: 12 }
const springGentle = { type: 'spring' as const, stiffness: 80, damping: 20 }

// ───────────────────────────────────────────────────────
// PREDEFINED CATEGORIES (outside component)
// ───────────────────────────────────────────────────────
const PREDEFINED_CATEGORIES = [
  { name: 'Vanities', icon: Bath, isPrimary: true, badge: 'Manufactured by Us', description: 'We design and manufacture every vanity in-house — ensuring premium quality, custom options, and factory-direct pricing.' },
  { name: 'Commode', icon: Package, isPrimary: false },
  { name: 'Basin', icon: Bath, isPrimary: false },
  { name: 'Shower Sets', icon: Droplets, isPrimary: false },
  { name: 'Art Bowls', icon: Star, isPrimary: false },
]

// ───────────────────────────────────────────────────────
// HERO IMAGES (outside component)
// ───────────────────────────────────────────────────────
const HERO_IMAGES = [
  '/bathroom-1.jpg',
  '/bathroom-2.jpg',
]

// ───────────────────────────────────────────────────────
// HERO TEXT REVEAL VARIANTS (outside component)
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

// Category icons mapping (outside component)
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

// Check if a category is the primary (Vanities)
const isPrimaryCategory = (category: string) => category.toLowerCase() === 'vanities'

// ───────────────────────────────────────────────────────
// HERO BACKGROUND SLIDESHOW — Auto-rotating bathroom images (CSS-based)
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
      {/* Mobile: bottom-heavy overlay so image shows on top, text readable on bottom */}
      <div className="absolute inset-0 sm:hidden bg-gradient-to-t from-[#080c14] via-[#080c14]/60 to-[#080c14]/10" />
      {/* Tablet: left-heavy overlay */}
      <div className="absolute inset-0 hidden sm:block lg:hidden bg-gradient-to-r from-[#080c14]/85 via-[#080c14]/50 to-[#080c14]/20" />
      {/* Desktop: left-heavy overlay, image clearly visible on right */}
      <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-[#080c14]/80 via-[#080c14]/40 to-transparent" />
      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-[#080c14] to-transparent" />
      {/* Slide indicators */}
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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('storefront')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)

  // Product form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPercent: 0,
    image: '',
    images: [] as string[],
    video: '',
    category: 'Vanities',
    featured: true,
    order: 0,
  })
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingExtra, setUploadingExtra] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Product detail view
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [detailImageIndex, setDetailImageIndex] = useState(0)
  const [detailImageKey, setDetailImageKey] = useState(0)

  // Site settings state
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
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({
    phone: '',
    whatsapp: '',
    email: '',
    instagram: '',
    facebook: '',
    youtube: '',
    address: '',
    businessHours: 'Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed',
    mapUrl: '',
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const [adminTab, setAdminTab] = useState<'products' | 'categories' | 'settings'>('products')
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [customCategoryInput, setCustomCategoryInput] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)

  const { toast } = useToast()
  const extraImageInputRef = useRef<HTMLInputElement>(null)

  // Parallax scroll for hero
  const heroRef = useRef<HTMLElement>(null)

  // Single shared IntersectionObserver for all scroll-reveal elements
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
  }, [products, viewMode, selectedCategory])

  // useMemo for filtered products
  const filteredProducts = useMemo(() =>
    products.filter(p => !selectedCategory || p.category.toLowerCase() === selectedCategory.toLowerCase()),
    [products, selectedCategory]
  )

  // useMemo for category counts
  const categoryCounts = useMemo(() =>
    products.reduce((acc, p) => { const key = p.category.trim(); acc[key] = (acc[key] || 0) + 1; return acc }, {} as Record<string, number>),
    [products]
  )

  // Case-insensitive lookup for category counts
  const getCategoryCount = (catName: string): number => {
    const lower = catName.toLowerCase().trim()
    return Object.entries(categoryCounts).reduce((total, [key, count]) =>
      key.toLowerCase().trim() === lower ? total + count : total, 0)
  }

  // Build full category list: predefined + any custom categories from DB
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

  // Parse images from product
  const getProductImages = (product: Product): string[] => {
    try {
      const parsed = JSON.parse(product.images || '[]')
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch {}
    return product.image ? [product.image] : []
  }

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

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Fetch site settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        setSettingsForm(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Save settings handler
  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        toast({ title: 'Settings Updated', description: 'Contact details have been saved successfully.' })
      } else {
        toast({ title: 'Save Failed', description: 'Failed to save settings.', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({ title: 'Save Failed', description: 'Failed to save settings.', variant: 'destructive' })
    } finally {
      setSavingSettings(false)
    }
  }

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

  // Auto-run database migration when admin logs in (ensures discountPercent column exists)
  const [migrationRun, setMigrationRun] = useState(false)
  useEffect(() => {
    if (!isAdminAuthenticated || migrationRun) return
    const runMigration = async () => {
      try {
        const res = await fetch('/api/migrate', { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          console.log('Migration result:', data.message)
          fetchProducts()
        }
      } catch (e) {
        console.error('Auto-migration failed:', e)
      }
      setMigrationRun(true)
    }
    runMigration()
  }, [isAdminAuthenticated, migrationRun, fetchProducts])

  // Admin login handler (server-side authentication)
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
        setViewMode('admin')
        setAdminPassword('')
        toast({ title: 'Welcome Admin!', description: 'You are now securely logged in. Session expires in 24 hours.' })
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

  // Admin logout handler
  const handleAdminLogout = async () => {
    try {
      await fetch('/api/auth/login', { method: 'DELETE' })
    } catch {}
    setIsAdminAuthenticated(false)
    setViewMode('storefront')
    toast({ title: 'Logged Out', description: 'You have been securely logged out.' })
  }

  // Image upload handler (main image)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
      const data = await res.json()
      if (data.url) {
        setFormData(prev => ({ ...prev, image: data.url }))
        toast({ title: 'Image Uploaded', description: 'Main product image uploaded successfully.' })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({ title: 'Upload Failed', description: 'Failed to upload image.', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  // Extra images upload handler (multiple)
  const handleExtraImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingExtra(true)
    try {
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', files[i])
        const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
        const data = await res.json()
        if (data.url) newUrls.push(data.url)
      }
      if (newUrls.length > 0) {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...newUrls] }))
        toast({ title: 'Images Uploaded', description: `${newUrls.length} image(s) uploaded successfully.` })
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      toast({ title: 'Upload Failed', description: 'Failed to upload images.', variant: 'destructive' })
    } finally {
      setUploadingExtra(false)
      if (extraImageInputRef.current) extraImageInputRef.current.value = ''
    }
  }

  // Remove extra image
  const removeExtraImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  // Video upload handler
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingVideo(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
      const data = await res.json()
      if (data.url) {
        setFormData(prev => ({ ...prev, video: data.url }))
        toast({ title: 'Video Uploaded', description: 'Product video uploaded successfully.' })
      }
    } catch (error) {
      console.error('Error uploading video:', error)
      toast({ title: 'Upload Failed', description: 'Failed to upload video.', variant: 'destructive' })
    } finally {
      setUploadingVideo(false)
    }
  }

  // Calculate discounted price from price string and discount percentage
  const calcDiscountedPrice = (priceStr: string, percent: number): string => {
    if (!percent || percent <= 0) return priceStr
    const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''))
    if (isNaN(num) || num <= 0) return priceStr
    const discounted = Math.round(num * (1 - percent / 100))
    const prefix = priceStr.match(/^[^0-9]*/)?.[0] || ''
    return prefix + discounted.toLocaleString('en-PK')
  }

  // Open product dialog for add/edit
  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      let parsedImages: string[] = []
      try { parsedImages = JSON.parse(product.images || '[]') } catch {}
      setFormData({
        name: product.name, description: product.description, price: product.price,
        discountPercent: product.discountPercent || 0,
        image: product.image, images: parsedImages, video: product.video || '',
        category: product.category, featured: product.featured, order: product.order,
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '', description: '', price: '', discountPercent: 0,
        image: '', images: [], video: '', category: 'Vanities', featured: true, order: products.length + 1,
      })
    }
    setShowProductDialog(true)
  }

  // Save product
  const handleSaveProduct = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.image) {
      toast({ title: 'Missing Fields', description: 'Please fill in all required fields including main image.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...formData,
        images: JSON.stringify(formData.images),
      }
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Update failed')
        }
        toast({ title: 'Product Updated', description: `${formData.name} has been updated.` })
      } else {
        const res = await fetch('/api/products', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Create failed')
        }
        toast({ title: 'Product Added', description: `${formData.name} has been added to your store.` })
      }
      setShowProductDialog(false)
      fetchProducts()
    } catch (error: any) {
      console.error('Error saving product:', error)
      toast({ title: 'Save Failed', description: error.message || 'Failed to save product.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      toast({ title: 'Product Deleted', description: 'Product has been removed.' })
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({ title: 'Delete Failed', description: 'Failed to delete product.', variant: 'destructive' })
    }
    setDeleteConfirm(null)
  }

  // Open product detail
  const openProductDetail = (product: Product) => {
    setSelectedProduct(product)
    setDetailImageIndex(0)
    setDetailImageKey(prev => prev + 1)
  }

  // ───────────────────────────────────────────────────────
  // PRODUCT DETAIL VIEW (overlay) — Kept with motion for modal open/close
  // ───────────────────────────────────────────────────────
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
          {/* Close button */}
          <button
            onClick={() => setSelectedProduct(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors hover:scale-110 hover:rotate-90 active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left: Images & Video */}
            <div className="p-6">
              {/* Main Image / Video */}
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
                {/* Navigation arrows */}
                {displayImages.length > 1 && detailImageIndex >= 0 && (
                  <>
                    <button
                      onClick={() => {
                        setDetailImageIndex((detailImageIndex - 1 + displayImages.length) % displayImages.length)
                        setDetailImageKey(prev => prev + 1)
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-all hover:scale-110 active:scale-90"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setDetailImageIndex((detailImageIndex + 1) % displayImages.length)
                        setDetailImageKey(prev => prev + 1)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-all hover:scale-110 active:scale-90 rotate-180"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </>
                )}
                {/* Image counter */}
                {displayImages.length > 1 && detailImageIndex >= 0 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
                    {detailImageIndex + 1} / {displayImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
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
                {/* Video thumbnail */}
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

            {/* Right: Product Info */}
            <div className="p-6 lg:p-8 flex flex-col justify-center">
              {/* Category badge */}
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

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                {selectedProduct.name}
                <a href={`/products/${selectedProduct.id}`} target="_blank" rel="noopener noreferrer" className="ml-3 inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-normal align-middle">
                  <Eye className="w-3.5 h-3.5" />
                  Open Page
                </a>
              </h2>

              <p className="text-gray-400 text-base mb-6 leading-relaxed">
                {selectedProduct.description}
              </p>

              <div className="mb-6">
                {selectedProduct.discountPercent > 0 ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                      {calcDiscountedPrice(selectedProduct.price, selectedProduct.discountPercent)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      {selectedProduct.price}
                    </span>
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
              <div className="flex gap-3">
                <a href="#contact" onClick={() => setSelectedProduct(null)}>
                  <Button size="lg" className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0 shadow-lg shadow-sky-600/25 btn-gradient-shift">
                    <Phone className="w-5 h-5 mr-2" />
                    Get Quote
                  </Button>
                </a>
                <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi Home Sense! 👋\n\nI'm interested in:\n\n📦 *${selectedProduct.name}*\n💰 Price: ${selectedProduct.discountPercent > 0 ? `${calcDiscountedPrice(selectedProduct.price, selectedProduct.discountPercent)} (${selectedProduct.discountPercent}% OFF! Was ${selectedProduct.price})` : selectedProduct.price}\n📂 Category: ${selectedProduct.category}\n\nPlease share more details. Thank you!`)}`} target="_blank" rel="noopener noreferrer">
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

  // ───────────────────────────────────────────────────────
  // STOREFRONT VIEW
  // ───────────────────────────────────────────────────────

  if (viewMode === 'storefront') {
    return (
      <div className="min-h-screen flex flex-col bg-[#080c14] text-white overflow-x-hidden">
        {/* Navigation — solid background instead of backdrop-blur */}
        <nav className="relative z-50 border-b border-white/8 bg-[#080c14]/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo Image + HOME SENSE text */}
              <a href="#home" className="flex items-center gap-2 sm:gap-3 cursor-pointer">
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
              </a>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-8">
                {[
                  { label: 'Home', href: '#home' },
                  { label: 'Vanities', href: '#products', isPrimary: true, category: 'Vanities' },
                  { label: 'Products', href: '#products' },
                  { label: 'About', href: '#about' },
                  { label: 'Contact', href: '#contact' },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => {
                      if ((link as any).category) {
                        setSelectedCategory(selectedCategory === (link as any).category ? null : (link as any).category)
                      }
                    }}
                    className={`text-sm transition-colors nav-link ${
                      (link as any).isPrimary
                        ? 'text-amber-400 hover:text-amber-300 font-semibold'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {(link as any).isPrimary && <Star className="w-3 h-3 inline mr-1 fill-amber-400" />}
                    {link.label}
                  </a>
                ))}
                <div>
                  <Button
                    onClick={() => {
                      if (isAdminAuthenticated) setViewMode('admin')
                      else setShowAdminLogin(true)
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
                  onClick={() => { if (isAdminAuthenticated) setViewMode('admin'); else setShowAdminLogin(true) }}
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

          {/* Mobile menu — solid background */}
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
                  {[
                    { label: 'Home', href: '#home' },
                    { label: 'Vanities', href: '#products', isPrimary: true, category: 'Vanities' },
                    { label: 'Products', href: '#products' },
                    { label: 'About', href: '#about' },
                    { label: 'Contact', href: '#contact' },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => {
                        if ((link as any).category) {
                          setSelectedCategory(selectedCategory === (link as any).category ? null : (link as any).category)
                        }
                        setMobileMenuOpen(false)
                      }}
                      className={`block py-2 px-3 rounded-lg transition-colors ${
                        (link as any).isPrimary
                          ? 'text-amber-400 font-semibold hover:text-amber-300 hover:bg-amber-500/10'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {(link as any).isPrimary && <Star className="w-3 h-3 inline mr-1 fill-amber-400" />}
                      {link.label}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Section — Bathroom background slideshow */}
        <section id="home" ref={heroRef} className="relative z-10 flex-1 flex items-center overflow-hidden">
          <HeroSlideshow />

          <div
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 sm:py-24 lg:py-32 w-full"
          >
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-end lg:items-center">
              <div>
                {/* Badge */}
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

                {/* Title */}
                <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold leading-snug sm:leading-tight lg:leading-none mb-4 sm:mb-6 [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
                  <motion.span
                    custom={1}
                    variants={heroTextVariants}
                    initial="hidden"
                    animate="visible"
                    className="block"
                  >
                    Innovative,
                  </motion.span>
                  <motion.span
                    custom={2}
                    variants={heroTextVariants}
                    initial="hidden"
                    animate="visible"
                    className="block"
                  >
                    <span className="bg-gradient-to-r from-sky-500 via-sky-300 to-sky-400 bg-clip-text text-transparent" style={{ backgroundSize: '200% auto' }}>
                      Efficient
                    </span>
                  </motion.span>
                  <motion.span
                    custom={3}
                    variants={heroTextVariants}
                    initial="hidden"
                    animate="visible"
                    className="block"
                  >
                    & Elegant
                  </motion.span>
                </h1>

                {/* Description */}
                <motion.p
                  custom={4}
                  variants={heroTextVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-sm sm:text-lg lg:text-xl text-gray-300 sm:text-gray-400 mb-5 sm:mb-8 max-w-lg [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]"
                >
                  Home Sense brings you premium sanitary wares — vanities manufactured by us, plus the complete range of commodes, basins, shower sets, and art bowls.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  custom={5}
                  variants={heroTextVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-wrap gap-3 sm:gap-4"
                >
                  <a href="#products">
                    <Button size="default" className="sm:h-12 sm:px-6 bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0 shadow-lg shadow-sky-600/25 btn-gradient-shift text-sm sm:text-base">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                      Explore Products
                    </Button>
                  </a>
                  <a href="#contact">
                    <Button size="default" className="sm:h-12 sm:px-6 border-white/20 text-gray-300 hover:text-white hover:border-white/40 text-sm sm:text-base">
                      Contact Us
                      <ArrowRight className="w-4 h-4 ml-1.5 sm:ml-2" />
                    </Button>
                  </a>
                </motion.div>
              </div>

              {/* Hero right — Glass card floating over bathroom image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative hidden lg:flex items-center justify-center"
              >
                <div className="relative">
                  {/* Glass card */}
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/20">
                    <img src="/logo-homesense.jpg" alt="Home Sense" loading="lazy" className="h-24 w-auto object-contain rounded-lg mx-auto mb-3" />
                    <p className="text-center text-white/90 text-sm font-semibold tracking-wide">Authorized & Trusted Dealer</p>
                  </div>
                  {/* Floating icon badges */}
                  <div
                    className="absolute -top-3 -right-3 bg-gradient-to-r from-sky-700 to-sky-500 rounded-xl p-3 shadow-lg shadow-sky-600/30"
                  >
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                  <div
                    className="absolute -bottom-3 -left-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-3 shadow-lg shadow-amber-500/30"
                  >
                    <Star className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Wave Divider — plain div */}
        <div className="wave-divider relative z-10 w-full">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[200%] h-full" preserveAspectRatio="none">
            <path d="M0 30C240 10 480 50 720 30C960 10 1200 50 1440 30C1680 10 1920 50 2160 30C2400 10 2640 50 2880 30V60H0V30Z" fill="rgba(2,132,199,0.03)" />
            <path d="M0 35C240 15 480 55 720 35C960 15 1200 55 1440 35C1680 15 1920 55 2160 35C2400 15 2640 55 2880 35V60H0V35Z" fill="rgba(56,189,248,0.02)" />
          </svg>
        </div>

        {/* Category Quick Links */}
        <section className="relative z-10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {CATEGORIES.filter(cat => (getCategoryCount(cat.name) || 0) > 0).map((cat, i) => (
                <div key={i} className={`scroll-reveal scroll-reveal-delay-${Math.min(i + 1, 4)}`}>
                  <div
                    onClick={() => {
                      setSelectedCategory(selectedCategory === cat.name ? null : cat.name)
                      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="group cursor-pointer"
                  >
                    <div className={`rounded-xl transition-all duration-300 p-5 text-center card-shine ${
                      selectedCategory === cat.name
                        ? cat.isPrimary
                          ? 'border-2 border-amber-400 bg-gradient-to-b from-amber-500/20 to-amber-500/5 shadow-lg shadow-amber-500/20'
                          : 'border-2 border-sky-400 bg-gradient-to-b from-sky-500/20 to-sky-500/5 shadow-lg shadow-sky-500/20'
                        : cat.isPrimary
                          ? 'border-2 border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent hover:border-amber-400/70 hover:from-amber-500/15'
                          : 'border border-white/8 bg-white/3 hover:bg-white/5 hover:border-sky-600/30'
                    }`}>
                      <div>
                        <cat.icon className={`w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform ${
                          selectedCategory === cat.name
                            ? cat.isPrimary ? 'text-amber-300' : 'text-sky-300'
                            : cat.isPrimary ? 'text-amber-400' : 'text-sky-400'
                        }`} />
                      </div>
                      <h3 className={`font-semibold text-sm mb-1 ${
                        selectedCategory === cat.name
                          ? cat.isPrimary ? 'text-amber-200' : 'text-sky-200'
                          : cat.isPrimary ? 'text-amber-300' : 'text-white'
                      }`}>{cat.name}</h3>
                      <span className="text-xs text-gray-500">{getCategoryCount(cat.name)} Products</span>
                      {cat.isPrimary && (
                        <div className="mt-2 flex items-center justify-center gap-1">
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">Manufactured by Us</span>
                        </div>
                      )}
                      {selectedCategory === cat.name && (
                        <div className="mt-2 flex items-center justify-center">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                            cat.isPrimary
                              ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                              : 'bg-sky-500/30 text-sky-200 border border-sky-400/40'
                          }`}>Showing</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Wave Divider — plain div */}
        <div className="wave-divider relative z-10 w-full">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[200%] h-full" preserveAspectRatio="none">
            <path d="M0 30C240 10 480 50 720 30C960 10 1200 50 1440 30C1680 10 1920 50 2160 30C2400 10 2640 50 2880 30V60H0V30Z" fill="rgba(2,132,199,0.03)" />
            <path d="M0 35C240 15 480 55 720 35C960 15 1200 55 1440 35C1680 15 1920 55 2160 35C2400 15 2640 55 2880 35V60H0V35Z" fill="rgba(56,189,248,0.02)" />
          </svg>
        </div>

        {/* Products Section — CSS-based product cards */}
        <section id="products" className="relative z-10 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="scroll-reveal text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Featured
                <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent" style={{ backgroundSize: '200% auto' }}> Products</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Discover our premium collection of vanities, commodes, basins, shower sets, and art bowls. Factory-direct vanities manufactured by us, plus the finest products — all available at Home Sense.
              </p>
              {/* Active Category Filter */}
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
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="ml-1 hover:text-white transition-colors"
                    >
                      ×
                    </button>
                  </span>
                </div>
              )}
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
                      <p className="text-gray-400 text-sm max-w-xl">We design and manufacture every vanity in-house — ensuring premium quality, custom options, and factory-direct pricing. No middlemen, no compromises.</p>
                    </div>
                    <span className="shrink-0 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium">
                      Direct from Factory
                    </span>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <ProductSkeleton />
            ) : (
              <div key={selectedCategory || 'all'} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {filteredProducts.map((product, index) => {
                  const productImages = getProductImages(product)
                  const totalImages = productImages.length + (product.video ? 1 : 0)
                  return (
                    <div key={product.id} className={`scroll-reveal scroll-reveal-delay-${Math.min((index % 4) + 1, 4)}`}>
                      <div
                          className="product-card group relative rounded-2xl overflow-hidden bg-white/5 border border-white/8 hover:border-sky-600/40 transition-all duration-500 cursor-pointer card-shine"
                          onClick={() => openProductDetail(product)}
                        >
                          {/* Product Image */}
                          <div className="relative aspect-square overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              className="product-card-img w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            {/* Category badge */}
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
                            {/* SALE badge */}
                            {product.discountPercent > 0 && (
                              <div className="absolute top-3 right-3">
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg shadow-red-500/40 flex items-center gap-1 animate-pulse">
                                  <Percent className="w-3 h-3" />
                                  {product.discountPercent}% OFF
                                </span>
                              </div>
                            )}
                            {/* Media count badge */}
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
                            {/* Quick view overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <div className="w-14 h-14 rounded-full bg-white/25 flex items-center justify-center border-2 border-white/40">
                                <Eye className="w-7 h-7 text-white" />
                              </div>
                            </div>
                            {/* Click hint */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <span className="text-xs text-white/80 bg-black/50 px-3 py-1 rounded-full">Click to view details</span>
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="p-5">
                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-sky-300 transition-colors duration-300">
                              <a href={`/products/${product.id}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                                {product.name}
                              </a>
                            </h3>
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {product.discountPercent > 0 ? (
                                  <>
                                    <span className="text-lg font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                                      {calcDiscountedPrice(product.price, product.discountPercent)}
                                    </span>
                                    <span className="text-sm text-gray-500 line-through">
                                      {product.price}
                                    </span>
                                    <span className="text-[10px] font-bold text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded-full">-{product.discountPercent}%</span>
                                  </>
                                ) : (
                                  <span className="text-lg font-bold bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent">
                                    {product.price}
                                  </span>
                                )}
                              </div>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0 shadow-md shadow-sky-600/20 btn-gradient-shift"
                                onClick={(e) => { e.stopPropagation(); openProductDetail(product) }}
                              >
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
                    <p className="text-gray-500 mb-4">No products in "{selectedCategory}" category yet.</p>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="px-4 py-2 rounded-lg bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600/30 transition-colors text-sm"
                    >
                      Show All Products
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Wave Divider — plain div */}
        <div className="wave-divider relative z-10 w-full">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[200%] h-full" preserveAspectRatio="none">
            <path d="M0 30C240 10 480 50 720 30C960 10 1200 50 1440 30C1680 10 1920 50 2160 30C2400 10 2640 50 2880 30V60H0V30Z" fill="rgba(2,132,199,0.03)" />
            <path d="M0 35C240 15 480 55 720 35C960 15 1200 55 1440 35C1680 15 1920 55 2160 35C2400 15 2640 55 2880 35V60H0V35Z" fill="rgba(56,189,248,0.02)" />
          </svg>
        </div>

        {/* Why Home Sense Section — plain HTML, scroll-reveal CSS */}
        <section id="about" className="relative z-10 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="scroll-reveal">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  All-in-One
                  <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent" style={{ backgroundSize: '200% auto' }}> Sanitary Wares</span>
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  Excellent details, durable components, compatible hardware result in premium quality. High standard, long life combined with superior performance thanks to the compatibility of all components, spare parts and durability. As the authorized dealer, Home Sense brings you the finest vanities, commodes, basins, shower sets, and art bowls — with our own manufactured vanities line.
                </p>
                <div className="space-y-6">
                  {[
                    { icon: CheckCircle, title: 'Quality Standards', desc: 'Carefully engineered, all parts complying with international standards. Premium materials built to last.' },
                    { icon: Star, title: 'Innovative Design', desc: 'Modern multifaceted solutions with aesthetically appealing and functional products that match your lifestyle.' },
                    { icon: Wrench, title: 'Spare Parts Available', desc: 'Long-term performance guaranteed with full compatibility of all components and readily available spare parts.' },
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
              </div>

              <div className="scroll-reveal">
                <div
                  className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-700/15 to-sky-500/15 blur-2xl"
                />
                <div className="relative rounded-3xl border border-white/8 overflow-hidden bg-white/3 p-8 sm:p-12">
                  <div className="text-center">
                    <div className="mx-auto mb-6">
                      <img src="/logo-homesense.jpg" alt="Home Sense" loading="lazy" className="h-28 w-auto object-contain rounded-xl mx-auto" />
                    </div>
                    <h3 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent mb-2"
                      style={{ backgroundSize: '200% auto' }}
                    >
                      HOME SENSE
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">
                      Sanitary Fitting & Ware
                    </p>
                    <p className="text-gray-500 text-xs mb-8">
                      Quality Sanitary Ware Solutions
                    </p>
                    <div className="mb-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/8 text-[10px] text-gray-400">
                        <CheckCircle className="w-3 h-3 text-sky-400" />
                        Distributed by Home Sense
                      </span>
                    </div>

                    {/* Static stats (replacing counter animation) */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="scroll-reveal">
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold text-white">50+</div>
                          <div className="text-xs text-gray-500 mt-1">Projects</div>
                        </div>
                      </div>
                      <div className="scroll-reveal scroll-reveal-delay-2">
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold text-white">150+</div>
                          <div className="text-xs text-gray-500 mt-1">Products</div>
                        </div>
                      </div>
                      <div className="scroll-reveal scroll-reveal-delay-3">
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold text-white">99%</div>
                          <div className="text-xs text-gray-500 mt-1">Quality</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wave Divider — plain div */}
        <div className="wave-divider relative z-10 w-full">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[200%] h-full" preserveAspectRatio="none">
            <path d="M0 30C240 10 480 50 720 30C960 10 1200 50 1440 30C1680 10 1920 50 2160 30C2400 10 2640 50 2880 30V60H0V30Z" fill="rgba(2,132,199,0.03)" />
            <path d="M0 35C240 15 480 55 720 35C960 15 1200 55 1440 35C1680 15 1920 55 2160 35C2400 15 2640 55 2880 35V60H0V35Z" fill="rgba(56,189,248,0.02)" />
          </svg>
        </div>

        {/* Contact Section */}
        <section id="contact" className="relative z-10 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="scroll-reveal text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Get in
                <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent" style={{ backgroundSize: '200% auto' }}> Touch</span>
              </h2>
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
                      <h3 className="text-xl sm:text-2xl font-bold text-white">
                        Visit Our
                        <span className="bg-gradient-to-r from-sky-400 to-sky-300 bg-clip-text text-transparent"> Showroom</span>
                      </h3>
                      <p className="text-gray-400 text-sm mt-0.5">Experience our premium collection in person</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Left: Address + Business Hours */}
                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Address */}
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

                                const isSpecificDay = (
                                  dayLabel === todayName || dayLabel === todayAbbr
                                )
                                const isRangeMatch = (
                                  (dayLabel.includes('mon-sun') && day >= 0 && day <= 6) ||
                                  (dayLabel.includes('mon-sat') && day >= 1 && day <= 6) ||
                                  (dayLabel.includes('mon-fri') && day >= 1 && day <= 5) ||
                                  (dayLabel.includes('every') || dayLabel.includes('daily'))
                                )

                                if (isSpecificDay) {
                                  if (timeStr.toLowerCase() === 'closed') {
                                    isOpen = false
                                  } else {
                                    const result = parseTimeRange(timeStr)
                                    isOpen = result === 1
                                  }
                                  matchedSpecific = true
                                  break
                                }

                                if (!matchedSpecific && isRangeMatch) {
                                  if (timeStr.toLowerCase() === 'closed') {
                                    isOpen = false
                                  } else {
                                    const result = parseTimeRange(timeStr)
                                    isOpen = result === 1
                                  }
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
                    {settings.address && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white font-medium text-sm transition-all hover:-translate-y-0.5"
                      >
                        <Navigation className="w-4 h-4" />
                        Get Directions on Google Maps
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    )}
                  </div>

                  {/* Right: Map Embed — OpenStreetMap for reliable pin */}
                  <div className="relative min-h-[300px] lg:min-h-[400px] bg-gray-900/50">
                    {settings.address ? (
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=73.04%2C31.40%2C73.16%2C31.50&layer=mapnik&marker=31.4504%2C73.1005`}
                        width="100%"
                        height="100%"
                        style={{ border: 0, minHeight: '300px' }}
                        allowFullScreen
                        loading="lazy"
                        title="Home Sense Showroom Location"
                        className="absolute inset-0 w-full h-full"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-3 p-6">
                        <MapPin className="w-12 h-12 opacity-30" />
                        <p className="text-sm text-center">Map will appear here once address is added in admin settings</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Detail Overlay */}
        <AnimatePresence>
          {selectedProduct && renderProductDetail()}
        </AnimatePresence>

        {/* Footer — plain HTML */}
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
      </div>
    )
  }

  // ───────────────────────────────────────────────────────
  // ADMIN PANEL VIEW — plain divs, no fancy animations needed
  // ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-white">
      {/* Admin Header — solid background */}
      <header className="border-b border-white/8 bg-[#080c14]/95 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <img src="/logo-homesense.jpg" alt="Home Sense" loading="lazy" className="h-12 sm:h-14 w-auto object-contain rounded-lg" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Home Sense Admin</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Manage your store & products</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setViewMode('storefront')}
                variant="outline" size="sm"
                className="border-white/15 text-gray-300 hover:text-white hover:border-sky-500 hover:bg-sky-600/10"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Store
              </Button>
              <Button
                onClick={handleAdminLogout}
                variant="ghost" size="sm"
                className="text-gray-400 hover:text-red-400"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Products', value: products.length, color: 'from-sky-600 to-sky-700' },
            { label: 'Featured', value: products.filter(p => p.featured).length, color: 'from-sky-500 to-sky-600' },
            { label: 'Categories', value: [...new Set(products.map(p => p.category))].length, color: 'from-sky-500 to-sky-600' },
            { label: 'Store Status', value: 'Live', color: 'from-green-500 to-green-600' },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/8 bg-white/3 p-4"
            >
              <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Admin Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/8 pb-0">
          <button
            onClick={() => setAdminTab('products')}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              adminTab === 'products'
                ? 'text-sky-400 border-sky-400'
                : 'text-gray-400 border-transparent hover:text-white hover:border-white/20'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Products
          </button>
          <button
            onClick={() => setAdminTab('categories')}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              adminTab === 'categories'
                ? 'text-sky-400 border-sky-400'
                : 'text-gray-400 border-transparent hover:text-white hover:border-white/20'
            }`}
          >
            <Bath className="w-4 h-4 inline mr-2" />
            Categories
          </button>
          <button
            onClick={() => setAdminTab('settings')}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              adminTab === 'settings'
                ? 'text-sky-400 border-sky-400'
                : 'text-gray-400 border-transparent hover:text-white hover:border-white/20'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Contact Details
          </button>
        </div>

        {/* Categories Tab Content */}
        {adminTab === 'categories' && (
          <div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8 max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-700/20 to-sky-500/20 border border-white/8 flex items-center justify-center">
                  <Bath className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Manage Categories</h3>
                  <p className="text-xs text-gray-500">Rename or delete product categories</p>
                </div>
              </div>

              {/* Categories List */}
              <div className="space-y-3">
                {CATEGORIES.map((cat) => {
                  const count = getCategoryCount(cat.name) || 0
                  const isEditing = editingCategory === cat.name
                  return (
                    <div key={cat.name} className="rounded-xl border border-white/8 bg-white/3 p-4">
                      {isEditing ? (
                        /* Edit Mode */
                        <div className="flex items-center gap-3">
                          <Input
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500"
                            placeholder="Category name..."
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter' && editCategoryName.trim() && editCategoryName.trim() !== cat.name) {
                                setSavingCategory(true)
                                try {
                                  const res = await fetch('/api/categories', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ oldName: cat.name, newName: editCategoryName.trim() }),
                                  })
                                  const data = await res.json()
                                  if (res.ok) {
                                    toast({ title: 'Category Renamed', description: data.message })
                                    setEditingCategory(null)
                                    setEditCategoryName('')
                                    fetchProducts()
                                  } else {
                                    toast({ title: 'Error', description: data.error, variant: 'destructive' })
                                  }
                                } catch {
                                  toast({ title: 'Error', description: 'Failed to rename category', variant: 'destructive' })
                                }
                                setSavingCategory(false)
                              } else if (e.key === 'Escape') {
                                setEditingCategory(null)
                                setEditCategoryName('')
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={async () => {
                              if (!editCategoryName.trim() || editCategoryName.trim() === cat.name) return
                              setSavingCategory(true)
                              try {
                                const res = await fetch('/api/categories', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ oldName: cat.name, newName: editCategoryName.trim() }),
                                })
                                const data = await res.json()
                                if (res.ok) {
                                  toast({ title: 'Category Renamed', description: data.message })
                                  setEditingCategory(null)
                                  setEditCategoryName('')
                                  fetchProducts()
                                } else {
                                  toast({ title: 'Error', description: data.error, variant: 'destructive' })
                                }
                              } catch {
                                toast({ title: 'Error', description: 'Failed to rename category', variant: 'destructive' })
                              }
                              setSavingCategory(false)
                            }}
                            disabled={savingCategory || !editCategoryName.trim() || editCategoryName.trim() === cat.name}
                            className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0"
                          >
                            {savingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setEditingCategory(null); setEditCategoryName('') }}
                            className="border-white/10 text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              cat.isPrimary ? 'bg-amber-500/20' : 'bg-sky-500/20'
                            }`}>
                              <cat.icon className={`w-4 h-4 ${cat.isPrimary ? 'text-amber-400' : 'text-sky-400'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white text-sm font-medium">{cat.name}</span>
                                {cat.isPrimary && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">Primary</span>
                                )}
                              </div>
                              <span className="text-gray-500 text-xs">{count} product{count !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setEditingCategory(cat.name); setEditCategoryName(cat.name) }}
                              className="border-white/10 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                const confirmMsg = count > 0
                                  ? `Delete "${cat.name}"?\n\nThis category has ${count} product${count !== 1 ? 's' : ''}.\n\nChoose:\n- OK = Delete all ${count} products too\n- Cancel = Keep products (reassign first)`
                                  : `Delete empty category "${cat.name}"?`

                                if (!confirm(confirmMsg)) return

                                setSavingCategory(true)
                                try {
                                  const res = await fetch('/api/categories', {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      categoryName: cat.name,
                                      action: 'delete',
                                    }),
                                  })
                                  const data = await res.json()
                                  if (res.ok) {
                                    toast({ title: 'Category Deleted', description: data.message })
                                    fetchProducts()
                                  } else {
                                    toast({ title: 'Error', description: data.error, variant: 'destructive' })
                                  }
                                } catch {
                                  toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' })
                                }
                                setSavingCategory(false)
                              }}
                              disabled={savingCategory}
                              className="border-white/10 text-red-400 hover:bg-red-500/10 hover:border-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Add New Category */}
              <div className="mt-6 border-t border-white/8 pt-5">
                <p className="text-gray-400 text-xs mb-3">To add a new category, create a product and type a new category name in the category field.</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab Content */}
        {adminTab === 'settings' && (
          <div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8 max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-700/20 to-sky-500/20 border border-white/8 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Contact Details</h3>
                  <p className="text-xs text-gray-500">Update your store contact information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-400" /> Phone Number
                  </Label>
                  <Input
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+92 300 1234567"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-400" /> WhatsApp Number
                  </Label>
                  <Input
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+92 300 1234567"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-400" /> Email Address
                  </Label>
                  <Input
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="info@zilver.co"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-400" /> Instagram
                  </Label>
                  <Input
                    value={settingsForm.instagram}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="@zilver.co"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-sky-500" /> Facebook Page URL
                  </Label>
                  <Input
                    value={settingsForm.facebook}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, facebook: e.target.value }))}
                    placeholder="https://facebook.com/zilver"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-400" /> YouTube Channel URL
                  </Label>
                  <Input
                    value={settingsForm.youtube}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, youtube: e.target.value }))}
                    placeholder="https://youtube.com/@zilver"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-gray-300 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" /> Address
                  </Label>
                  <Textarea
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Your business address"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500 min-h-[80px]"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-gray-300 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400" /> Business Hours
                  </Label>
                  <p className="text-[11px] text-gray-500 mb-1">Use | to separate lines. Example: Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed</p>
                  <Textarea
                    value={settingsForm.businessHours}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, businessHours: e.target.value }))}
                    placeholder="Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500 min-h-[60px]"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-gray-300 text-sm flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-green-400" /> Google Maps Embed URL
                  </Label>
                  <p className="text-[11px] text-gray-500 mb-1">Go to Google Maps → Share → Embed a map → Copy ONLY the src URL from the iframe code</p>
                  <Input
                    value={settingsForm.mapUrl}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, mapUrl: e.target.value }))}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0 min-w-[160px]"
                >
                  {savingSettings ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab Content */}
        {adminTab === 'products' && (
        <>
        {/* Products Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Products</h2>
          <Button
            onClick={() => openProductDialog()}
            className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No Products Yet</h3>
            <p className="text-gray-600 mb-6">Add your first product to get started.</p>
            <Button onClick={() => openProductDialog()} className="bg-gradient-to-r from-sky-700 to-sky-500 text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const productImages = getProductImages(product)
              return (
                <div key={product.id}>
                  <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden hover:border-sky-600/30 transition-colors group">
                    {/* Product Image */}
                    <div className="relative aspect-video overflow-hidden bg-black/30">
                      <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {productImages.length > 1 && (
                          <span className="px-2 py-1 rounded-full text-xs bg-white/20 text-white flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> {productImages.length}
                          </span>
                        )}
                        {product.video && (
                          <span className="px-2 py-1 rounded-full text-xs bg-red-500/80 text-white flex items-center gap-1">
                            <Play className="w-3 h-3 fill-white" /> Video
                          </span>
                        )}
                        {product.featured && (
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/80 text-white flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white" /> Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white">{product.name}</h3>
                          <span className={`text-xs ${isPrimaryCategory(product.category) ? 'text-amber-400 font-medium' : 'text-sky-400'}`}>
                            {product.category}
                            {isPrimaryCategory(product.category) && ' ⭐'}
                          </span>
                        </div>
                        <div className="text-right">
                          {product.discountPercent > 0 ? (
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-sm font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                                {calcDiscountedPrice(product.price, product.discountPercent)}
                              </span>
                              <span className="text-xs text-gray-500 line-through">
                                {product.price}
                              </span>
                              <span className="text-[10px] font-bold text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded-full">-{product.discountPercent}%</span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent">
                              {product.price}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.description}</p>
                      <div className="flex gap-2">
                        <Button onClick={() => openProductDialog(product)} variant="outline" size="sm"
                          className="flex-1 border-white/10 text-gray-300 hover:text-white hover:border-sky-500 hover:bg-sky-600/10">
                          <Edit3 className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button onClick={() => setDeleteConfirm(product.id)} variant="outline" size="sm"
                          className="border-white/10 text-gray-300 hover:text-red-400 hover:border-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        </>
        )}
      </main>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="bg-[#0d1220] border-white/10 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {editingProduct ? (
                <><Edit3 className="w-5 h-5 text-sky-500" /> Edit Product</>
              ) : (
                <><Plus className="w-5 h-5 text-sky-500" /> Add New Product</>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingProduct ? 'Update product details below.' : 'Fill in the details to add a new product.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Main Image Upload */}
            <div>
              <Label className="text-gray-300">Main Product Image *</Label>
              <div className="mt-2">
                {formData.image ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img src={formData.image} alt="Preview" className="w-full aspect-video object-cover" />
                    <Button onClick={() => setFormData(prev => ({ ...prev, image: '' }))} variant="destructive" size="sm" className="absolute top-2 right-2">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-sky-600/50 transition-colors cursor-pointer py-8 bg-white/3">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-500 mb-2" />
                    )}
                    <span className="text-sm text-gray-400">{uploading ? 'Uploading...' : 'Click to upload main image'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>
            </div>

            {/* Extra Images Upload (Multiple) */}
            <div>
              <Label className="text-gray-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-500" />
                Additional Images ({formData.images.length} uploaded)
              </Label>
              <div className="mt-2">
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden border border-white/10 group/img">
                        <img src={img} alt={`Extra ${i + 1}`} className="w-full aspect-square object-cover" />
                        <button
                          onClick={() => removeExtraImage(i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-sky-600/50 transition-colors cursor-pointer py-6 bg-white/3">
                  {uploadingExtra ? (
                    <Loader2 className="w-6 h-6 text-sky-500 animate-spin mb-2" />
                  ) : (
                    <Plus className="w-6 h-6 text-gray-500 mb-2" />
                  )}
                  <span className="text-sm text-gray-400">{uploadingExtra ? 'Uploading...' : 'Click to add more images'}</span>
                  <span className="text-xs text-gray-600 mt-1">Select multiple images at once</span>
                  <input
                    ref={extraImageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleExtraImagesUpload}
                    className="hidden"
                    disabled={uploadingExtra}
                  />
                </label>
              </div>
            </div>

            {/* Product Name */}
            <div>
              <Label className="text-gray-300">Product Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Luxury Vanity Unit"
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-600 focus:ring-sky-600/20" />
            </div>

            {/* Video Upload */}
            <div>
              <Label className="text-gray-300 flex items-center gap-2">
                <Film className="w-4 h-4 text-sky-400" />
                Product Video (Optional)
              </Label>
              <div className="mt-2">
                {formData.video ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <video src={formData.video} controls className="w-full aspect-video object-contain bg-black/50" />
                    <div className="flex gap-2 mt-2">
                      <Button onClick={() => setFormData(prev => ({ ...prev, video: '' }))} variant="destructive" size="sm" className="text-xs">
                        <X className="w-3 h-3 mr-1" /> Remove Video
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-sky-500/50 transition-colors cursor-pointer py-6 bg-white/3">
                    {uploadingVideo ? (
                      <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-2" />
                    ) : (
                      <Video className="w-8 h-8 text-gray-500 mb-2" />
                    )}
                    <span className="text-sm text-gray-400">{uploadingVideo ? 'Uploading video...' : 'Click to upload video'}</span>
                    <span className="text-xs text-gray-600 mt-1">MP4, WebM, MOV supported</span>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" disabled={uploadingVideo} />
                  </label>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="text-gray-300">Description *</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your product..." rows={3}
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-600 focus:ring-sky-600/20" />
            </div>

            {/* Price & Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Price *</Label>
                <Input value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g. Rs. 18,500"
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-600 focus:ring-sky-600/20" />
              </div>
              <div>
                <Label className="text-gray-300">Category</Label>
                <div className="mt-2 flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="flex-1 rounded-md border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:border-sky-600 focus:ring-sky-600/20 focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.name} value={cat.name} className="bg-[#0d1220] text-white">
                        {cat.name}{cat.isPrimary ? ' ⭐ Primary' : ''}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomCategory(true)}
                    className="shrink-0 border-sky-500/30 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {showCustomCategory && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      placeholder="Type new category name..."
                      className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500 focus:ring-sky-500/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (customCategoryInput.trim()) {
                            setFormData(prev => ({ ...prev, category: customCategoryInput.trim() }))
                            setCustomCategoryInput('')
                            setShowCustomCategory(false)
                            toast({ title: 'Category Added', description: `"${customCategoryInput.trim()}" will appear when you save this product.` })
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (customCategoryInput.trim()) {
                          setFormData(prev => ({ ...prev, category: customCategoryInput.trim() }))
                          setCustomCategoryInput('')
                          setShowCustomCategory(false)
                          toast({ title: 'Category Added', description: `"${customCategoryInput.trim()}" will appear when you save this product.` })
                        }
                      }}
                      className="shrink-0 bg-gradient-to-r from-sky-500 to-sky-600 text-white border-0"
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setShowCustomCategory(false); setCustomCategoryInput('') }}
                      className="shrink-0 text-gray-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Sale / Discount Section */}
            <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-red-400" />
                <Label className="text-gray-300 font-semibold">Discount / Sale</Label>
              </div>
              <p className="text-xs text-gray-500">Set 0 for no discount, or enter a percentage (1-90%) to put this product on sale.</p>
              <div>
                <Label className="text-gray-300">Discount Percentage</Label>
                <div className="mt-2 flex items-center gap-3">
                  <Input
                    type="number"
                    min={0}
                    max={90}
                    value={formData.discountPercent || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: Math.min(90, Math.max(0, parseInt(e.target.value) || 0)) }))}
                    placeholder="0 = no discount"
                    className="flex-1 bg-white/5 border-red-500/30 text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-red-500/20"
                  />
                  <span className="text-gray-400 text-lg font-bold">%</span>
                </div>
              </div>
              {/* Live Preview */}
              {formData.discountPercent > 0 && formData.price && (
                <div className="rounded-lg bg-black/30 border border-white/5 p-3 space-y-2">
                  <p className="text-xs text-gray-500 font-medium">Live Preview:</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                      {calcDiscountedPrice(formData.price, formData.discountPercent)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formData.price}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                      -{formData.discountPercent}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Featured & Order Row */}
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="flex items-center gap-3">
                <Switch checked={formData.featured} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))} />
                <Label className="text-gray-300">Featured Product</Label>
              </div>
              <div>
                <Label className="text-gray-300">Display Order</Label>
                <Input type="number" value={formData.order} onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-600 focus:ring-sky-600/20" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowProductDialog(false)} variant="outline" className="border-white/10 text-gray-300 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleSaveProduct} disabled={saving}
              className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {editingProduct ? 'Update' : 'Save'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-[#0d1220] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Delete Product
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeleteConfirm(null)} variant="outline" className="border-white/10 text-gray-300 hover:text-white">
              Cancel
            </Button>
            <Button onClick={() => deleteConfirm && handleDeleteProduct(deleteConfirm)} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
