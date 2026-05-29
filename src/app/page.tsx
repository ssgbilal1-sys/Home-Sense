'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion'
import {
  Droplets, Menu, X, Plus, Trash2, Edit3,
  Upload, Save, ChevronRight, Phone, Mail,
  ArrowRight, Eye, Settings, Shield,
  Facebook, Instagram, Youtube, MessageCircle,
  Wrench, Bath, CookingPot, MapPin,
  Star, CheckCircle, Loader2, Package, Video,
  Play, Film, ChevronLeft, ImageIcon, XCircle
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
}

// ───────────────────────────────────────────────────────
// COUNTER ANIMATION HOOK — Counts up from 0 when visible, resets on scroll away
// ───────────────────────────────────────────────────────
function useCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })

  useEffect(() => {
    if (!isInView) return
    let startTime: number | null = null
    let cancelled = false
    const step = (timestamp: number) => {
      if (cancelled) return
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
    return () => { cancelled = true }
  }, [isInView, target, duration])

  return { count: isInView ? count : 0, ref }
}

// ───────────────────────────────────────────────────────
// 3D TILT CARD COMPONENT — Mouse-tracking 3D perspective
// ───────────────────────────────────────────────────────
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8
    const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 8
    x.set(rotateY)
    y.set(rotateX)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springY,
        rotateY: springX,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ───────────────────────────────────────────────────────
// RIPPLE BUTTON WRAPPER — Material-style ripple on click
// ───────────────────────────────────────────────────────
function RippleButton({ children, className, onClick, ...props }: React.ComponentProps<typeof Button> & { children: React.ReactNode }) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current
    if (button) {
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      const ripple = document.createElement('span')
      ripple.className = 'ripple-effect'
      ripple.style.width = ripple.style.height = `${size}px`
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      button.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    }
    onClick?.(e)
  }

  return (
    <Button ref={buttonRef} className={`ripple-container ${className || ''}`} onClick={handleClick} {...props}>
      {children}
    </Button>
  )
}

// ───────────────────────────────────────────────────────
// WAVE SECTION DIVIDER
// ───────────────────────────────────────────────────────
function WaveDivider() {
  return (
    <div className="wave-divider relative z-10 w-full">
      <svg
        viewBox="0 0 1440 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[200%] h-full"
        preserveAspectRatio="none"
      >
        <path
          d="M0 30C240 10 480 50 720 30C960 10 1200 50 1440 30C1680 10 1920 50 2160 30C2400 10 2640 50 2880 30V60H0V30Z"
          fill="rgba(13,148,136,0.03)"
        />
        <path
          d="M0 35C240 15 480 55 720 35C960 15 1200 55 1440 35C1680 15 1920 55 2160 35C2400 15 2640 55 2880 35V60H0V35Z"
          fill="rgba(20,184,166,0.02)"
        />
      </svg>
    </div>
  )
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
// SPRING TRANSITION PRESETS
// ───────────────────────────────────────────────────────
const springTransition = { type: 'spring' as const, stiffness: 100, damping: 15 }
const springBouncy = { type: 'spring' as const, stiffness: 200, damping: 12 }
const springGentle = { type: 'spring' as const, stiffness: 80, damping: 20 }

// ───────────────────────────────────────────────────────
// SCROLL REVEAL — Dramatic scroll-triggered reveal with blur+scale+slide
// ───────────────────────────────────────────────────────
function ScrollReveal({ children, className, delay = 0, direction = 'up', distance = 40 }: {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.15 })

  const directionMap = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionMap[direction], scale: 0.95, filter: 'blur(8px)' }}
      animate={isInView
        ? { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }
        : { opacity: 0, ...directionMap[direction], scale: 0.95, filter: 'blur(8px)' }
      }
      transition={{
        delay,
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ───────────────────────────────────────────────────────
// MAGNETIC HOVER — Mouse-following magnetic effect on cards
// ───────────────────────────────────────────────────────
function MagneticHover({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * 0.15)
    y.set((e.clientY - centerY) * 0.15)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ───────────────────────────────────────────────────────
// TEXT REVEAL — Character-by-character staggered text animation
// ───────────────────────────────────────────────────────
function TextReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.5 })

  return (
    <motion.span ref={ref} className={className}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 20, filter: 'blur(8px)' }}
          transition={{ delay: i * 0.03, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  )
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('storefront')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
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
  })
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({
    phone: '',
    whatsapp: '',
    email: '',
    instagram: '',
    facebook: '',
    youtube: '',
    address: '',
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const [adminTab, setAdminTab] = useState<'products' | 'settings'>('products')
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [customCategoryInput, setCustomCategoryInput] = useState('')

  const { toast } = useToast()
  const extraImageInputRef = useRef<HTMLInputElement>(null)

  // Parallax scroll for hero
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  // Scroll-linked parallax for background orbs
  const { scrollYProgress: orbScrollProgress } = useScroll()
  const orbY1 = useTransform(orbScrollProgress, [0, 1], [0, -200])
  const orbY2 = useTransform(orbScrollProgress, [0, 1], [0, -150])
  const orbY3 = useTransform(orbScrollProgress, [0, 1], [0, -100])

  // Counter animations for stats
  const counter500 = useCounter(500, 2000)
  const counter300 = useCounter(300, 2000)
  const counter100 = useCounter(100, 1500)

  // Calculate category counts from products
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

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

  // Open product dialog for add/edit
  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      let parsedImages: string[] = []
      try { parsedImages = JSON.parse(product.images || '[]') } catch {}
      setFormData({
        name: product.name, description: product.description, price: product.price,
        image: product.image, images: parsedImages, video: product.video || '',
        category: product.category, featured: product.featured, order: product.order,
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '', description: '', price: '', image: '', images: [],
        video: '', category: 'Vanities', featured: true, order: products.length + 1,
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
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
        toast({ title: 'Product Updated', description: `${formData.name} has been updated.` })
      } else {
        await fetch('/api/products', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
        toast({ title: 'Product Added', description: `${formData.name} has been added to your store.` })
      }
      setShowProductDialog(false)
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      toast({ title: 'Save Failed', description: 'Failed to save product.', variant: 'destructive' })
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

  // Category configuration — predefined + dynamic from products
  const PREDEFINED_CATEGORIES = [
    { name: 'Vanities', icon: Bath, isPrimary: true, badge: 'Manufactured by Us', description: 'We design and manufacture every vanity in-house — ensuring premium quality, custom options, and factory-direct pricing.' },
    { name: 'Commode', icon: Package, isPrimary: false },
    { name: 'Basin', icon: Bath, isPrimary: false },
    { name: 'Shower Sets', icon: Droplets, isPrimary: false },
    { name: 'Art Bowls', icon: Star, isPrimary: false },
  ]

  // Build full category list: predefined + any custom categories from DB
  const dbCategoryNames = [...new Set(products.map(p => p.category))]
  const customCategoryNames = dbCategoryNames.filter(
    name => !PREDEFINED_CATEGORIES.some(c => c.name.toLowerCase() === name.toLowerCase())
  )
  const CATEGORIES = [
    ...PREDEFINED_CATEGORIES,
    ...customCategoryNames.map(name => ({ name, icon: Droplets, isPrimary: false })),
  ]

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

  // Check if a category is the primary (Vanities)
  const isPrimaryCategory = (category: string) => category.toLowerCase() === 'vanities'

  // ───────────────────────────────────────────────────────
  // HERO TEXT REVEAL VARIANTS — Staggered luxury reveal
  // ───────────────────────────────────────────────────────
  const heroTextVariants = {
    hidden: { opacity: 0, y: 60, skewY: 3 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      skewY: 0,
      transition: {
        delay: 0.3 + i * 0.15,
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  }

  // ───────────────────────────────────────────────────────
  // PRODUCT DETAIL VIEW (overlay) — Enhanced with animations
  // ───────────────────────────────────────────────────────
  const renderProductDetail = () => {
    if (!selectedProduct) return null
    const allImages = getProductImages(selectedProduct)
    const displayImages = allImages[0] === selectedProduct.image ? allImages : [selectedProduct.image, ...allImages.filter(img => img !== selectedProduct.image)]

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
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
          <motion.button
            onClick={() => setSelectedProduct(null)}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>

          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left: Images & Video */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, ...springGentle }}
              className="p-6"
            >
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
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setDetailImageIndex((detailImageIndex - 1 + displayImages.length) % displayImages.length)
                        setDetailImageKey(prev => prev + 1)
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setDetailImageIndex((detailImageIndex + 1) % displayImages.length)
                        setDetailImageKey(prev => prev + 1)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors rotate-180"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                  </>
                )}
                {/* Image counter */}
                {displayImages.length > 1 && detailImageIndex >= 0 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm">
                    {detailImageIndex + 1} / {displayImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {displayImages.map((img, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setDetailImageIndex(i); setDetailImageKey(prev => prev + 1) }}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      detailImageIndex === i ? 'border-teal-400 ring-1 ring-teal-400/50' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img} alt={`${selectedProduct.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
                {/* Video thumbnail */}
                {selectedProduct.video && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDetailImageIndex(-1)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all relative ${
                      detailImageIndex === -1 ? 'border-red-400 ring-1 ring-red-400/50' : 'border-white/10 hover:border-red-400/50'
                    }`}
                  >
                    <img src={selectedProduct.image} alt="Video" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Right: Product Info — slides in from right */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, ...springGentle }}
              className="p-6 lg:p-8 flex flex-col justify-center"
            >
              {/* Category badge — Vanities highlighted */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-4"
              >
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm text-white flex items-center gap-1.5 w-fit ${
                  isPrimaryCategory(selectedProduct.category)
                    ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 shadow-lg shadow-amber-500/30'
                    : 'bg-gradient-to-r from-teal-700/80 to-teal-500/80'
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
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3"
              >
                {selectedProduct.name}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-gray-400 text-base mb-6 leading-relaxed"
              >
                {selectedProduct.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-teal-400 bg-clip-text text-transparent mb-6"
              >
                {selectedProduct.price}
              </motion.div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {[
                  { icon: CheckCircle, text: 'Premium Quality Materials' },
                  { icon: Star, text: 'International Standards Compliant' },
                  { icon: Wrench, text: 'Spare Parts Available' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1, ...springTransition }}
                    className="flex items-center gap-3"
                  >
                    <item.icon className="w-5 h-5 text-teal-400 shrink-0" />
                    <span className="text-gray-300 text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex gap-3"
              >
                <a href="#contact" onClick={() => setSelectedProduct(null)}>
                  <RippleButton size="lg" className="bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white border-0 shadow-lg shadow-teal-600/25 btn-gradient-shift">
                    <Phone className="w-5 h-5 mr-2" />
                    Get Quote
                  </RippleButton>
                </a>
                <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-400">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp
                  </Button>
                </a>
              </motion.div>
            </motion.div>
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
        {/* Animated background — Floating Orbs with scroll-linked parallax */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <motion.div style={{ y: orbY1 }} className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-700/15 rounded-full blur-[180px] orb-float-1" />
          <motion.div style={{ y: orbY2 }} className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px] orb-float-2" />
          <motion.div style={{ y: orbY3 }} className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-[120px] orb-float-3" />
        </div>

        {/* Navigation — Enhanced with logo glow, active indicators, smooth mobile menu */}
        <nav className="relative z-50 border-b border-white/8 backdrop-blur-xl bg-[#080c14]/85">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo — Animated HOME SENSE text */}
              <motion.a
                href="#home"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={springTransition}
                className="flex items-center gap-2 sm:gap-3 cursor-pointer"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center"
                >
                  <span className="text-xl sm:text-2xl font-extrabold tracking-wider">
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                      className="bg-gradient-to-r from-teal-400 via-teal-300 to-teal-500 bg-clip-text text-transparent"
                      style={{ backgroundSize: '200% auto' }}
                    >
                      HOME
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="text-white"
                    >
                      {' '}SENSE
                    </motion.span>
                  </span>
                </motion.div>
              </motion.a>

              {/* Desktop Nav — with sliding underline indicators */}
              <div className="hidden md:flex items-center gap-8">
                {[
                  { label: 'Home', href: '#home' },
                  { label: 'Vanities', href: '#products', isPrimary: true },
                  { label: 'Products', href: '#products' },
                  { label: 'About', href: '#about' },
                  { label: 'Contact', href: '#contact' },
                ].map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, ...springTransition }}
                    className={`text-sm transition-colors nav-link ${
                      (link as any).isPrimary
                        ? 'text-amber-400 hover:text-amber-300 font-semibold'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {(link as any).isPrimary && <Star className="w-3 h-3 inline mr-1 fill-amber-400" />}
                    {link.label}
                  </motion.a>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, ...springTransition }}
                >
                  <Button
                    onClick={() => {
                      if (isAdminAuthenticated) setViewMode('admin')
                      else setShowAdminLogin(true)
                    }}
                    variant="outline"
                    size="sm"
                    className="border-white/15 text-gray-300 hover:text-white hover:border-teal-500 hover:bg-teal-600/10"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Admin
                  </Button>
                </motion.div>
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

          {/* Mobile menu — Enhanced with stagger and backdrop blur */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="md:hidden border-t border-white/8 bg-[#080c14]/95 backdrop-blur-xl overflow-hidden"
              >
                <div className="px-4 py-4 space-y-1">
                  {[
                    { label: 'Home', href: '#home' },
                    { label: 'Vanities', href: '#products', isPrimary: true },
                    { label: 'Products', href: '#products' },
                    { label: 'About', href: '#about' },
                    { label: 'Contact', href: '#contact' },
                  ].map((link, i) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, ...springTransition }}
                      className={`block py-2 px-3 rounded-lg transition-colors ${
                        (link as any).isPrimary
                          ? 'text-amber-400 font-semibold hover:text-amber-300 hover:bg-amber-500/10'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {(link as any).isPrimary && <Star className="w-3 h-3 inline mr-1 fill-amber-400" />}
                      {link.label}
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Section — Parallax, staggered text reveal, shimmer, badge glow */}
        <section id="home" ref={heroRef} className="relative z-10 flex-1 flex items-center">
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                {/* Badge — glow pulse */}
                <motion.div
                  custom={0}
                  variants={heroTextVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 glow-pulse"
                >
                  <span className="text-sm font-bold bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">HOME SENSE</span>
                  <span className="text-sm text-gray-400">Sanitary Fitting & Ware Showroom</span>
                </motion.div>

                {/* Title — Character-by-character text reveal */}
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] mb-6 overflow-hidden">
                  <motion.span
                    custom={1}
                    variants={heroTextVariants}
                    initial="hidden"
                    animate="visible"
                    className="block"
                  >
                    <TextReveal text="Innovative," />
                  </motion.span>
                  <motion.span
                    custom={2}
                    variants={heroTextVariants}
                    initial="hidden"
                    animate="visible"
                    className="block"
                  >
                    <span className="bg-gradient-to-r from-teal-500 via-teal-300 to-teal-400 bg-clip-text text-transparent text-shimmer" style={{ backgroundSize: '200% auto' }}>
                      <TextReveal text="Efficient" />
                    </span>
                  </motion.span>
                  <motion.span
                    custom={3}
                    variants={heroTextVariants}
                    initial="hidden"
                    animate="visible"
                    className="block"
                  >
                    <TextReveal text="& Elegant" />
                  </motion.span>
                </h1>

                {/* Description */}
                <motion.p
                  custom={4}
                  variants={heroTextVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-lg sm:text-xl text-gray-400 mb-8 max-w-lg"
                >
                  Home Sense brings you premium sanitary wares — vanities manufactured by us, plus the complete Zilver range of commodes, basins, shower sets, and art bowls for every space.
                </motion.p>

                {/* CTA Buttons — with gradient shift and ripple */}
                <motion.div
                  custom={5}
                  variants={heroTextVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-wrap gap-4"
                >
                  <a href="#products">
                    <RippleButton size="lg" className="bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white border-0 shadow-lg shadow-teal-600/25 btn-gradient-shift">
                      <Package className="w-5 h-5 mr-2" />
                      Explore Products
                    </RippleButton>
                  </a>
                  <a href="#contact">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" variant="outline" className="border-white/20 text-gray-300 hover:text-white hover:border-white/40">
                        Contact Us
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  </a>
                </motion.div>
              </div>

              {/* Hero right — Floating elements with enhanced animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 0.4, ...springTransition }}
                className="relative hidden lg:block"
              >
                <div className="relative w-full aspect-square max-w-md mx-auto">
                  {/* Glow behind image */}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.25, 0.35, 0.25] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-700/25 to-teal-500/25 blur-3xl"
                  />
                  <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-8">
                    <img src="/logo-homesense.jpg" alt="Home Sense" className="w-full h-full object-contain rounded-2xl" />
                  </div>
                  {/* Floating badges with spring physics */}
                  <motion.div
                    animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                    className="absolute -top-4 -right-4 bg-gradient-to-r from-teal-700 to-teal-500 rounded-2xl p-4 shadow-xl shadow-teal-600/20"
                  >
                    <Droplets className="w-6 h-6 text-white" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5, delay: 1.2, ease: 'easeInOut' }}
                    className="absolute -bottom-4 -left-4 bg-gradient-to-r from-teal-500 to-teal-500 rounded-2xl p-4 shadow-xl shadow-teal-500/20"
                  >
                    <CheckCircle className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Wave Divider */}
        <WaveDivider />

        {/* Category Quick Links — Icon bounce, card glow */}
        <section className="relative z-10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {CATEGORIES.filter(cat => (categoryCounts[cat.name] || 0) > 0).map((cat, i) => (
                <ScrollReveal key={i} delay={i * 0.1} direction="up" distance={30}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="group cursor-pointer"
                  >
                    <div className={`rounded-xl transition-all duration-300 p-5 text-center card-shine card-glow card-glow-trail ${
                      cat.isPrimary
                        ? 'border-2 border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent hover:border-amber-400/70 hover:from-amber-500/15'
                        : 'border border-white/8 bg-white/3 hover:bg-white/5 hover:border-teal-600/30'
                    }`}>
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={springBouncy}
                      >
                        <cat.icon className={`w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform ${
                          cat.isPrimary ? 'text-amber-400' : 'text-teal-400'
                        }`} />
                      </motion.div>
                      <h3 className={`font-semibold text-sm mb-1 ${
                        cat.isPrimary ? 'text-amber-300' : 'text-white'
                      }`}>{cat.name}</h3>
                      <span className="text-xs text-gray-500">{categoryCounts[cat.name] || 0} Products</span>
                      {cat.isPrimary && (
                        <div className="mt-2 flex items-center justify-center gap-1">
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">Manufactured by Us</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Wave Divider */}
        <WaveDivider />

        {/* Products Section — 3D tilt, shine sweep, stagger, price float */}
        <section id="products" className="relative z-10 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Featured
                <span className="bg-gradient-to-r from-teal-500 to-teal-400 bg-clip-text text-transparent text-shimmer" style={{ backgroundSize: '200% auto' }}> Products</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Discover our premium collection of vanities, commodes, basins, shower sets, and art bowls. Factory-direct vanities manufactured by us, plus the finest Zilver products — all available at Home Sense.
              </p>
            </ScrollReveal>

            {/* Vanities Manufacturer Banner */}
            {products.some(p => isPrimaryCategory(p.category)) && (
              <ScrollReveal className="mb-10">
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
              </ScrollReveal>
            )}

            {loading ? (
              <ProductSkeleton />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {products.map((product, index) => {
                  const productImages = getProductImages(product)
                  const totalImages = productImages.length + (product.video ? 1 : 0)
                  return (
                    <ScrollReveal key={product.id} delay={index * 0.12} direction="up" distance={60}>
                      <MagneticHover>
                        <TiltCard className="group">
                        <motion.div
                          whileHover={{ y: -8 }}
                          transition={springTransition}
                          className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/8 hover:border-teal-600/40 transition-all duration-500 cursor-pointer card-shine"
                          onClick={() => openProductDetail(product)}
                        >
                          {/* Product Image — enhanced zoom with parallax */}
                          <div className="relative aspect-square overflow-hidden">
                            <motion.img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700 ease-out"
                              whileHover={{ scale: 1.15 }}
                              transition={{ duration: 0.7 }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            {/* Category badge — Vanities gets special highlight */}
                            <div className="absolute top-3 left-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm text-white flex items-center gap-1 ${
                                isPrimaryCategory(product.category)
                                  ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 shadow-lg shadow-amber-500/30'
                                  : 'bg-gradient-to-r from-teal-700/80 to-teal-500/80'
                              }`}>
                                {(() => { const Icon = getCategoryIcon(product.category); return <Icon className="w-3 h-3" /> })()}
                                {product.category}
                                {isPrimaryCategory(product.category) && <Star className="w-3 h-3 ml-0.5 fill-amber-200" />}
                              </span>
                            </div>
                            {/* Media count badge */}
                            {totalImages > 1 && (
                              <div className="absolute top-3 right-3 flex gap-1">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3" /> {productImages.length}
                                </span>
                                {product.video && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/80 backdrop-blur-sm text-white flex items-center gap-1">
                                    <Play className="w-3 h-3 fill-white" />
                                  </span>
                                )}
                              </div>
                            )}
                            {/* Quick view overlay — smooth reveal */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <motion.div
                                initial={{ scale: 0.8 }}
                                whileHover={{ scale: 1 }}
                                className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center border-2 border-white/40"
                              >
                                <Eye className="w-7 h-7 text-white" />
                              </motion.div>
                            </div>
                            {/* Click hint */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              whileHover={{ opacity: 1, y: 0 }}
                              className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                              <span className="text-xs text-white/80 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">Click to view details</span>
                            </motion.div>
                          </div>

                          {/* Product Info */}
                          <div className="p-5">
                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-teal-300 transition-colors duration-300">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold bg-gradient-to-r from-teal-500 to-teal-400 bg-clip-text text-transparent price-float">
                                {product.price}
                              </span>
                              <RippleButton
                                size="sm"
                                className="bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white border-0 shadow-md shadow-teal-600/20 btn-gradient-shift"
                                onClick={(e) => { e.stopPropagation(); openProductDetail(product) }}
                              >
                                View Details
                              </RippleButton>
                            </div>
                          </div>
                            </motion.div>
                      </TiltCard>
                      </MagneticHover>
                    </ScrollReveal>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Wave Divider */}
        <WaveDivider />

        {/* Why Zilver Section — Enhanced scroll reveals, counter animation, spring feature items */}
        <section id="about" className="relative z-10 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <ScrollReveal direction="left" distance={60}>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.15 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
                >
                  All-in-One
                  <span className="bg-gradient-to-r from-teal-500 to-teal-400 bg-clip-text text-transparent text-shimmer" style={{ backgroundSize: '200% auto' }}> Sanitary Wares</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.15 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-400 text-lg mb-8"
                >
                  Excellent details, durable components, compatible hardware result in Zilver quality. High standard, long life combined with superior performance thanks to the compatibility of all components, spare parts and durability. As the authorized distributor, Home Sense brings you the finest vanities, commodes, basins, shower sets, and art bowls — with our own manufactured vanities line.
                </motion.p>
                <div className="space-y-6">
                  {[
                    { icon: CheckCircle, title: 'Quality Standards', desc: 'Carefully engineered, all parts complying with international standards. Premium materials built to last.' },
                    { icon: Star, title: 'Innovative Design', desc: 'Modern multifaceted solutions with aesthetically appealing and functional products that match your lifestyle.' },
                    { icon: Wrench, title: 'Spare Parts Available', desc: 'Long-term performance guaranteed with full compatibility of all components and readily available spare parts.' },
                  ].map((item, i) => (
                    <ScrollReveal key={i} delay={i * 0.15} direction="left" distance={30}>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex gap-4 group cursor-default"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={springBouncy}
                          className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-teal-700/20 to-teal-500/20 border border-white/8 flex items-center justify-center"
                        >
                          <item.icon className="w-6 h-6 text-teal-400" />
                        </motion.div>
                        <div>
                          <h3 className="font-semibold text-white mb-1 group-hover:text-teal-300 transition-colors">{item.title}</h3>
                          <p className="text-gray-400 text-sm">{item.desc}</p>
                        </div>
                      </motion.div>
                    </ScrollReveal>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" distance={60}>
                <motion.div
                  animate={{ scale: [1, 1.02, 1], opacity: [0.15, 0.2, 0.15] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-700/15 to-teal-500/15 blur-2xl"
                />
                <div className="relative rounded-3xl border border-white/8 overflow-hidden bg-white/3 p-8 sm:p-12">
                  <div className="text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: false, amount: 0.15 }}
                      transition={{ delay: 0.2, ...springBouncy }}
                      className="mx-auto mb-6"
                    >
                      <img src="/logo-homesense.jpg" alt="Home Sense" className="h-20 w-auto object-contain rounded-xl mx-auto" />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.15 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-500 to-teal-400 bg-clip-text text-transparent mb-2 text-shimmer"
                      style={{ backgroundSize: '200% auto' }}
                    >
                      HOME SENSE
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: false, amount: 0.15 }}
                      transition={{ delay: 0.4 }}
                      className="text-sm text-gray-400 mb-2"
                    >
                      Sanitary Fitting & Ware
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: false, amount: 0.15 }}
                      transition={{ delay: 0.45 }}
                      className="text-gray-500 text-xs mb-8"
                    >
                      Quality Sanitary Ware Solutions
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.15 }}
                      transition={{ delay: 0.48 }}
                      className="mb-6"
                    >
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/8 text-[10px] text-gray-400">
                        <CheckCircle className="w-3 h-3 text-teal-400" />
                        Distributed by Home Sense
                      </span>
                    </motion.div>

                    {/* Counter animation stats */}
                    <div className="grid grid-cols-3 gap-4" ref={counter500.ref}>
                      <ScrollReveal delay={0.5} distance={20}>
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold text-white">{counter500.count}+</div>
                          <div className="text-xs text-gray-500 mt-1">Projects</div>
                        </div>
                      </ScrollReveal>
                      <ScrollReveal delay={0.6} distance={20}>
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold text-white">{counter300.count}+</div>
                          <div className="text-xs text-gray-500 mt-1">Products</div>
                        </div>
                      </ScrollReveal>
                      <ScrollReveal delay={0.7} distance={20}>
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold text-white">{counter100.count}%</div>
                          <div className="text-xs text-gray-500 mt-1">Quality</div>
                        </div>
                      </ScrollReveal>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Wave Divider */}
        <WaveDivider />

        {/* Contact Section — Icon animations, card stagger */}
        <section id="contact" className="relative z-10 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Get in
                <span className="bg-gradient-to-r from-teal-500 to-teal-400 bg-clip-text text-transparent text-shimmer" style={{ backgroundSize: '200% auto' }}> Touch</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Have a question or need a quote? We would love to hear from you.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.15} className="max-w-4xl mx-auto">
              <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-8 sm:p-12 card-shine">
                {/* Contact Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: Phone, label: 'Call Us', value: settings.phone, href: `tel:${settings.phone}`, color: 'from-green-500/20 to-green-600/20 border-green-500/20', iconColor: 'text-green-400' },
                    { icon: MessageCircle, label: 'WhatsApp', value: settings.whatsapp, href: `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`, color: 'from-green-500/20 to-green-600/20 border-green-500/20', iconColor: 'text-green-400' },
                    { icon: Mail, label: 'Email', value: settings.email, href: `mailto:${settings.email}`, color: 'from-teal-500/20 to-teal-700/20 border-teal-500/20 border-teal-500/20', iconColor: 'text-teal-400' },
                    { icon: Instagram, label: 'Instagram', value: settings.instagram, href: `https://instagram.com/${settings.instagram.replace('@', '')}`, color: 'from-pink-500/20 to-purple-600/20 border-pink-500/20', iconColor: 'text-pink-400' },
                    ...(settings.facebook ? [{ icon: Facebook, label: 'Facebook', value: settings.facebook.replace(/https?:\/\/(www\.)?facebook\.com\/?/i, '').replace(/\/$/, '') || 'Facebook Page', href: settings.facebook, color: 'from-teal-600/20 to-teal-800/20 border-teal-600/20', iconColor: 'text-teal-500' }] : []),
                    ...(settings.youtube ? [{ icon: Youtube, label: 'YouTube', value: settings.youtube.replace(/https?:\/\/(www\.)?youtube\.com\/(c\/|@)?/i, '').replace(/\/$/, '') || 'YouTube Channel', href: settings.youtube, color: 'from-red-500/20 to-red-700/20 border-red-500/20', iconColor: 'text-red-400' }] : []),
                  ].map((contact, i) => (
                    <ScrollReveal key={i} delay={0.2 + i * 0.08} distance={20}>
                      <motion.a
                        href={contact.href}
                        target={contact.href.startsWith('http') ? '_blank' : undefined}
                        rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        whileHover={{ scale: 1.05, y: -3 }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                      >
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                          transition={springBouncy}
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${contact.color} border flex items-center justify-center icon-bounce-hover`}
                        >
                          <contact.icon className={`w-5 h-5 ${contact.iconColor}`} />
                        </motion.div>
                        <div className="text-center">
                          <div className="font-semibold text-white text-xs">{contact.label}</div>
                          <div className="text-gray-400 text-[11px] mt-0.5 break-all leading-tight max-w-[140px]">{contact.value}</div>
                        </div>
                      </motion.a>
                    </ScrollReveal>
                  ))}
                </div>

                {/* Address Section - Full width below */}
                {settings.address && (
                  <ScrollReveal delay={0.6} distance={20}>
                    <div className="border-t border-white/8 pt-5 mt-2">
                      <motion.div
                        whileHover={{ scale: 1.01, x: 4 }}
                        className="flex items-start gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                          transition={springBouncy}
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/20 flex items-center justify-center shrink-0"
                        >
                          <MapPin className="w-5 h-5 text-amber-400" />
                        </motion.div>
                        <div>
                          <div className="font-semibold text-white text-sm mb-1">Our Address</div>
                          <div className="text-gray-400 text-sm leading-relaxed">{settings.address}</div>
                        </div>
                      </motion.div>
                    </div>
                  </ScrollReveal>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Product Detail Overlay */}
        <AnimatePresence>
          {selectedProduct && renderProductDetail()}
        </AnimatePresence>

        {/* Footer — Scroll reveal */}
        <motion.footer
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 border-t border-white/8 py-8 mt-auto"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex items-center gap-2"
              >
                <img
                  src="/logo-homesense.jpg"
                  alt="Home Sense"
                  className="h-10 w-auto object-contain rounded-lg"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex items-center gap-4"
              >
                {[
                  { Icon: Facebook, href: settings.facebook || '#' },
                  { Icon: Instagram, href: settings.instagram ? `https://instagram.com/${settings.instagram.replace('@', '')}` : '#' },
                  { Icon: Youtube, href: settings.youtube || '#' },
                ].filter(s => s.href !== '#').map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <social.Icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </motion.div>
              <motion.p
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-gray-600 text-xs"
              >
                &copy; {new Date().getFullYear()} Home Sense. All rights reserved.
              </motion.p>
            </div>
          </div>
        </motion.footer>

        {/* Admin Login Dialog */}
        <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
          <DialogContent className="bg-[#0d1220] border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-500" />
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
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-teal-600 focus:ring-teal-600/20"
                />
              </div>
              <p className="text-xs text-gray-500">
                <span className="text-gray-500">Session expires in 24 hours</span>
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleAdminLogin} disabled={loginLoading} className="bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white border-0">
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
  // ADMIN PANEL VIEW
  // ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-white">
      {/* Admin Header */}
      <header className="border-b border-white/8 backdrop-blur-xl bg-[#080c14]/90 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <img src="/logo-homesense.jpg" alt="Home Sense" className="h-9 sm:h-10 w-auto object-contain rounded-lg" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Home Sense Admin</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Manage your store & products</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setViewMode('storefront')}
                variant="outline" size="sm"
                className="border-white/15 text-gray-300 hover:text-white hover:border-teal-500 hover:bg-teal-600/10"
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
            { label: 'Total Products', value: products.length, color: 'from-teal-600 to-teal-700' },
            { label: 'Featured', value: products.filter(p => p.featured).length, color: 'from-teal-500 to-teal-600' },
            { label: 'Categories', value: [...new Set(products.map(p => p.category))].length, color: 'from-teal-500 to-teal-600' },
            { label: 'Store Status', value: 'Live', color: 'from-green-500 to-green-600' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, ...springTransition }}
              className="rounded-xl border border-white/8 bg-white/3 p-4"
            >
              <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Admin Tabs — Products & Settings */}
        <div className="flex gap-2 mb-6 border-b border-white/8 pb-0">
          <button
            onClick={() => setAdminTab('products')}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              adminTab === 'products'
                ? 'text-teal-400 border-teal-400'
                : 'text-gray-400 border-transparent hover:text-white hover:border-white/20'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Products
          </button>
          <button
            onClick={() => setAdminTab('settings')}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              adminTab === 'settings'
                ? 'text-teal-400 border-teal-400'
                : 'text-gray-400 border-transparent hover:text-white hover:border-white/20'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Contact Details
          </button>
        </div>

        {/* Settings Tab Content */}
        {adminTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
          >
            <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-6 sm:p-8 max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-700/20 to-teal-500/20 border border-white/8 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-teal-400" />
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
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-teal-500"
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
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-teal-400" /> Email Address
                  </Label>
                  <Input
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="info@zilver.co"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-teal-500"
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
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-teal-500" /> Facebook Page URL
                  </Label>
                  <Input
                    value={settingsForm.facebook}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, facebook: e.target.value }))}
                    placeholder="https://facebook.com/zilver"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-teal-500"
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
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-teal-500"
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
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-teal-500 min-h-[80px]"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white border-0 min-w-[160px]"
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
          </motion.div>
        )}

        {/* Products Tab Content */}
        {adminTab === 'products' && (
        <>
        {/* Products Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Products</h2>
          <Button
            onClick={() => openProductDialog()}
            className="bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No Products Yet</h3>
            <p className="text-gray-600 mb-6">Add your first product to get started.</p>
            <Button onClick={() => openProductDialog()} className="bg-gradient-to-r from-teal-700 to-teal-500 text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => {
              const productImages = getProductImages(product)
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, ...springTransition }}
                >
                  <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden hover:border-teal-600/30 transition-colors group">
                    {/* Product Image */}
                    <div className="relative aspect-video overflow-hidden bg-black/30">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                          <span className={`text-xs ${isPrimaryCategory(product.category) ? 'text-amber-400 font-medium' : 'text-teal-400'}`}>
                            {product.category}
                            {isPrimaryCategory(product.category) && ' ⭐'}
                          </span>
                        </div>
                        <span className="text-sm font-bold bg-gradient-to-r from-teal-500 to-teal-400 bg-clip-text text-transparent">
                          {product.price}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.description}</p>
                      <div className="flex gap-2">
                        <Button onClick={() => openProductDialog(product)} variant="outline" size="sm"
                          className="flex-1 border-white/10 text-gray-300 hover:text-white hover:border-teal-500 hover:bg-teal-600/10">
                          <Edit3 className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button onClick={() => setDeleteConfirm(product.id)} variant="outline" size="sm"
                          className="border-white/10 text-gray-300 hover:text-red-400 hover:border-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
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
                <><Edit3 className="w-5 h-5 text-teal-500" /> Edit Product</>
              ) : (
                <><Plus className="w-5 h-5 text-teal-500" /> Add New Product</>
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
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-teal-600/50 transition-colors cursor-pointer py-8 bg-white/3">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" />
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
                <ImageIcon className="w-4 h-4 text-teal-500" />
                Additional Images ({formData.images.length} uploaded)
              </Label>
              <div className="mt-2">
                {/* Show uploaded extra images */}
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
                {/* Upload more images */}
                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-teal-600/50 transition-colors cursor-pointer py-6 bg-white/3">
                  {uploadingExtra ? (
                    <Loader2 className="w-6 h-6 text-teal-500 animate-spin mb-2" />
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
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-teal-600 focus:ring-teal-600/20" />
            </div>

            {/* Video Upload */}
            <div>
              <Label className="text-gray-300 flex items-center gap-2">
                <Film className="w-4 h-4 text-teal-400" />
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
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-teal-500/50 transition-colors cursor-pointer py-6 bg-white/3">
                    {uploadingVideo ? (
                      <Loader2 className="w-8 h-8 text-teal-400 animate-spin mb-2" />
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
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-teal-600 focus:ring-teal-600/20" />
            </div>

            {/* Price & Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Price *</Label>
                <Input value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g. Rs. 18,500"
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-teal-600 focus:ring-teal-600/20" />
              </div>
              <div>
                <Label className="text-gray-300">Category</Label>
                <div className="mt-2 flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="flex-1 rounded-md border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:border-teal-600 focus:ring-teal-600/20 focus:outline-none"
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
                    className="shrink-0 border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400"
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
                      className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-teal-500 focus:ring-teal-500/20"
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
                      className="shrink-0 bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0"
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

            {/* Featured & Order Row */}
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="flex items-center gap-3">
                <Switch checked={formData.featured} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))} />
                <Label className="text-gray-300">Featured Product</Label>
              </div>
              <div>
                <Label className="text-gray-300">Display Order</Label>
                <Input type="number" value={formData.order} onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-teal-600 focus:ring-teal-600/20" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowProductDialog(false)} variant="outline" className="border-white/10 text-gray-300 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleSaveProduct} disabled={saving}
              className="bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white border-0">
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
