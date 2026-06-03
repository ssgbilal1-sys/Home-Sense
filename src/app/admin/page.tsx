'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import {
  Plus, Trash2, Edit3, Upload, Save, Eye,
  Settings, Shield, Package, Bath, Droplets, Star,
  Loader2, Video, Film, Play, ImageIcon, XCircle, X,
  Tag, Percent, Phone, MessageCircle, Mail, Instagram,
  Facebook, Youtube, MapPin, Clock, Navigation
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

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(true)
  const [adminTab, setAdminTab] = useState<'products' | 'categories' | 'settings' | 'reviews'>('products')

  // Product form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', discountPercent: 0,
    image: '', images: [] as string[], video: '', category: 'Vanities',
    featured: true, order: 0,
  })
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingExtra, setUploadingExtra] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [customCategoryInput, setCustomCategoryInput] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)

  // Review form state
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    name: '', rating: 5, comment: '', date: '', approved: true, order: 0,
  })
  const [savingReview, setSavingReview] = useState(false)
  const [deleteReviewConfirm, setDeleteReviewConfirm] = useState<string | null>(null)

  // Settings state
  const [settings, setSettings] = useState<SiteSettings>({
    phone: '', whatsapp: '', email: '', instagram: '', facebook: '', youtube: '',
    address: '', businessHours: 'Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed', mapUrl: '',
  })
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({
    phone: '', whatsapp: '', email: '', instagram: '', facebook: '', youtube: '',
    address: '', businessHours: 'Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed', mapUrl: '',
  })
  const [savingSettings, setSavingSettings] = useState(false)

  const { toast } = useToast()
  const extraImageInputRef = useRef<HTMLInputElement>(null)

  // Migration state
  const [migrationRun, setMigrationRun] = useState(false)

  // Categories
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

  const categoryCounts = useMemo(() =>
    products.reduce((acc, p) => { const key = p.category.trim(); acc[key] = (acc[key] || 0) + 1; return acc }, {} as Record<string, number>),
    [products]
  )

  const getCategoryCount = (catName: string): number => {
    const lower = catName.toLowerCase().trim()
    return Object.entries(categoryCounts).reduce((total, [key, count]) =>
      key.toLowerCase().trim() === lower ? total + count : total, 0)
  }

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify')
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated) {
            setIsAdminAuthenticated(true)
            setShowAdminLogin(false)
          }
        }
      } catch {}
    }
    checkAuth()
  }, [])

  // Auto-run migration when admin logs in
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
  }, [isAdminAuthenticated, migrationRun])

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
      const res = await fetch('/api/reviews')
      if (res.ok) setReviews(await res.json())
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
        setSettingsForm(data)
      }
    } catch {}
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  // Admin login
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
        toast({ title: 'Welcome Admin!', description: 'You are now securely logged in.' })
      } else {
        if (data.locked) {
          toast({ title: 'Account Locked', description: data.error, variant: 'destructive' })
        } else {
          const remaining = data.attemptsLeft !== undefined ? ` ${data.attemptsLeft} attempt(s) remaining.` : ''
          toast({ title: 'Invalid Credentials', description: `Wrong password.${remaining}`, variant: 'destructive' })
        }
      }
    } catch {
      toast({ title: 'Connection Error', description: 'Could not connect to server.', variant: 'destructive' })
    } finally {
      setLoginLoading(false)
    }
  }

  // Admin logout
  const handleAdminLogout = async () => {
    try { await fetch('/api/auth/login', { method: 'DELETE' }) } catch {}
    setIsAdminAuthenticated(false)
    toast({ title: 'Logged Out', description: 'You have been securely logged out.' })
    window.location.href = '/'
  }

  // Image upload handlers
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
        toast({ title: 'Image Uploaded', description: 'Main product image uploaded.' })
      }
    } catch { toast({ title: 'Upload Failed', description: 'Failed to upload image.', variant: 'destructive' }) }
    finally { setUploading(false) }
  }

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
        toast({ title: 'Images Uploaded', description: `${newUrls.length} image(s) uploaded.` })
      }
    } catch { toast({ title: 'Upload Failed', description: 'Failed to upload images.', variant: 'destructive' }) }
    finally { setUploadingExtra(false); if (extraImageInputRef.current) extraImageInputRef.current.value = '' }
  }

  const removeExtraImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

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
        toast({ title: 'Video Uploaded', description: 'Product video uploaded.' })
      }
    } catch { toast({ title: 'Upload Failed', description: 'Failed to upload video.', variant: 'destructive' }) }
    finally { setUploadingVideo(false) }
  }

  // Product CRUD
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

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.image) {
      toast({ title: 'Missing Fields', description: 'Please fill in all required fields.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const payload = { ...formData, images: JSON.stringify(formData.images) }
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
        if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.error || 'Update failed') }
        toast({ title: 'Product Updated', description: `${formData.name} has been updated.` })
      } else {
        const res = await fetch('/api/products', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
        if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.error || 'Create failed') }
        toast({ title: 'Product Added', description: `${formData.name} has been added.` })
      }
      setShowProductDialog(false)
      fetchProducts()
    } catch (error: any) {
      toast({ title: 'Save Failed', description: error.message || 'Failed to save product.', variant: 'destructive' })
    } finally { setSaving(false) }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      toast({ title: 'Product Deleted', description: 'Product has been removed.' })
      fetchProducts()
    } catch { toast({ title: 'Delete Failed', description: 'Failed to delete product.', variant: 'destructive' }) }
    setDeleteConfirm(null)
  }

  // Settings save
  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settingsForm),
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        toast({ title: 'Settings Updated', description: 'Contact details have been saved.' })
      } else { toast({ title: 'Save Failed', description: 'Failed to save settings.', variant: 'destructive' }) }
    } catch { toast({ title: 'Save Failed', description: 'Failed to save settings.', variant: 'destructive' }) }
    finally { setSavingSettings(false) }
  }

  // Review CRUD
  const openReviewDialog = (review?: Review) => {
    if (review) {
      setEditingReview(review)
      setReviewForm({ name: review.name, rating: review.rating, comment: review.comment, date: review.date, approved: review.approved, order: review.order })
    } else {
      setEditingReview(null)
      setReviewForm({ name: '', rating: 5, comment: '', date: '', approved: true, order: reviews.length + 1 })
    }
    setShowReviewDialog(true)
  }

  const handleSaveReview = async () => {
    if (!reviewForm.name || !reviewForm.comment) {
      toast({ title: 'Missing Fields', description: 'Name and comment are required.', variant: 'destructive' })
      return
    }
    setSavingReview(true)
    try {
      if (editingReview) {
        const res = await fetch(`/api/reviews/${editingReview.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reviewForm),
        })
        if (!res.ok) throw new Error('Update failed')
        toast({ title: 'Review Updated', description: `${reviewForm.name}'s review has been updated.` })
      } else {
        const res = await fetch('/api/reviews', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reviewForm),
        })
        if (!res.ok) throw new Error('Create failed')
        toast({ title: 'Review Added', description: `${reviewForm.name}'s review has been added.` })
      }
      setShowReviewDialog(false)
      fetchReviews()
    } catch {
      toast({ title: 'Save Failed', description: 'Failed to save review.', variant: 'destructive' })
    } finally { setSavingReview(false) }
  }

  const handleDeleteReview = async (id: string) => {
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      toast({ title: 'Review Deleted', description: 'Review has been removed.' })
      fetchReviews()
    } catch { toast({ title: 'Delete Failed', description: 'Failed to delete review.', variant: 'destructive' }) }
    setDeleteReviewConfirm(null)
  }

  const toggleReviewApproval = async (review: Review) => {
    try {
      await fetch(`/api/reviews/${review.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: !review.approved }),
      })
      toast({ title: 'Review Updated', description: `Review ${review.approved ? 'unapproved' : 'approved'}.` })
      fetchReviews()
    } catch { toast({ title: 'Update Failed', description: 'Failed to update review.', variant: 'destructive' }) }
  }

  // Not authenticated - show login
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c14]">
        <Dialog open={showAdminLogin} onOpenChange={(open) => { if (!open) window.location.href = '/' }}>
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
            </div>
            <DialogFooter>
              <Button onClick={handleAdminLogin} disabled={loginLoading} className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0">
                {loginLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                {loginLoading ? 'Verifying...' : 'Login'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Authenticated - show admin panel
  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Admin Header */}
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
              <a href="/">
                <Button variant="outline" size="sm" className="border-white/15 text-gray-300 hover:text-white hover:border-sky-500 hover:bg-sky-600/10">
                  <Eye className="w-4 h-4 mr-1" />View Store
                </Button>
              </a>
              <Button onClick={handleAdminLogout} variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Products', value: products.length, color: 'from-sky-600 to-sky-700' },
            { label: 'Featured', value: products.filter(p => p.featured).length, color: 'from-sky-500 to-sky-600' },
            { label: 'Categories', value: [...new Set(products.map(p => p.category))].length, color: 'from-sky-500 to-sky-600' },
            { label: 'Reviews', value: reviews.length, color: 'from-amber-500 to-amber-600' },
            { label: 'Store Status', value: 'Live', color: 'from-green-500 to-green-600' },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-4">
              <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Admin Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/8 pb-0 overflow-x-auto">
          {[
            { key: 'products' as const, label: 'Products', icon: Package },
            { key: 'categories' as const, label: 'Categories', icon: Bath },
            { key: 'settings' as const, label: 'Contact Details', icon: Settings },
            { key: 'reviews' as const, label: 'Reviews', icon: Star },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setAdminTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${
                adminTab === tab.key ? 'text-sky-400 border-sky-400' : 'text-gray-400 border-transparent hover:text-white hover:border-white/20'
              }`}
            >
              <tab.icon className="w-4 h-4 inline mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {adminTab === 'products' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Products</h2>
              <Button onClick={() => openProductDialog()} className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0">
                <Plus className="w-4 h-4 mr-2" />Add Product
              </Button>
            </div>
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-sky-400" /></div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No Products Yet</h3>
                <p className="text-gray-600 mb-6">Add your first product to get started.</p>
                <Button onClick={() => openProductDialog()} className="bg-gradient-to-r from-sky-700 to-sky-500 text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />Add Product
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const productImages = getProductImages(product)
                  return (
                    <div key={product.id}>
                      <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden hover:border-sky-600/30 transition-colors group">
                        <div className="relative aspect-video overflow-hidden bg-black/30">
                          <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-2 right-2 flex gap-1">
                            {productImages.length > 1 && <span className="px-2 py-1 rounded-full text-xs bg-white/20 text-white flex items-center gap-1"><ImageIcon className="w-3 h-3" />{productImages.length}</span>}
                            {product.video && <span className="px-2 py-1 rounded-full text-xs bg-red-500/80 text-white flex items-center gap-1"><Play className="w-3 h-3 fill-white" />Video</span>}
                            {product.featured && <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/80 text-white flex items-center gap-1"><Star className="w-3 h-3 fill-white" />Featured</span>}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-white">{product.name}</h3>
                              <span className={`text-xs ${isPrimaryCategory(product.category) ? 'text-amber-400 font-medium' : 'text-sky-400'}`}>
                                {product.category}{isPrimaryCategory(product.category) && ' ⭐'}
                              </span>
                            </div>
                            <div className="text-right">
                              {product.discountPercent > 0 ? (
                                <div className="flex flex-col items-end gap-0.5">
                                  <span className="text-sm font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">{calcDiscountedPrice(product.price, product.discountPercent)}</span>
                                  <span className="text-xs text-gray-500 line-through">{product.price}</span>
                                  <span className="text-[10px] font-bold text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded-full">-{product.discountPercent}%</span>
                                </div>
                              ) : (
                                <span className="text-sm font-bold bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent">{product.price}</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.description}</p>
                          <div className="flex gap-2">
                            <Button onClick={() => openProductDialog(product)} variant="outline" size="sm" className="flex-1 border-white/10 text-gray-300 hover:text-white hover:border-sky-500 hover:bg-sky-600/10">
                              <Edit3 className="w-3 h-3 mr-1" />Edit
                            </Button>
                            <Button onClick={() => setDeleteConfirm(product.id)} variant="outline" size="sm" className="border-white/10 text-gray-300 hover:text-red-400 hover:border-red-400 hover:bg-red-500/10">
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

        {/* Categories Tab */}
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
              <div className="space-y-3">
                {CATEGORIES.map((cat) => {
                  const count = getCategoryCount(cat.name) || 0
                  const isEditing = editingCategory === cat.name
                  return (
                    <div key={cat.name} className="rounded-xl border border-white/8 bg-white/3 p-4">
                      {isEditing ? (
                        <div className="flex items-center gap-3">
                          <Input value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)}
                            className="flex-1 bg-white/5 border-white/10 text-white focus:border-sky-500"
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter' && editCategoryName.trim() && editCategoryName.trim() !== cat.name) {
                                setSavingCategory(true)
                                try {
                                  const res = await fetch('/api/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldName: cat.name, newName: editCategoryName.trim() }) })
                                  const data = await res.json()
                                  if (res.ok) { toast({ title: 'Category Renamed', description: data.message }); setEditingCategory(null); setEditCategoryName(''); fetchProducts() }
                                  else { toast({ title: 'Error', description: data.error, variant: 'destructive' }) }
                                } catch { toast({ title: 'Error', description: 'Failed to rename category', variant: 'destructive' }) }
                                setSavingCategory(false)
                              } else if (e.key === 'Escape') { setEditingCategory(null); setEditCategoryName('') }
                            }}
                          />
                          <Button size="sm" onClick={async () => {
                            if (!editCategoryName.trim() || editCategoryName.trim() === cat.name) return
                            setSavingCategory(true)
                            try {
                              const res = await fetch('/api/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldName: cat.name, newName: editCategoryName.trim() }) })
                              const data = await res.json()
                              if (res.ok) { toast({ title: 'Category Renamed', description: data.message }); setEditingCategory(null); setEditCategoryName(''); fetchProducts() }
                              else { toast({ title: 'Error', description: data.error, variant: 'destructive' }) }
                            } catch { toast({ title: 'Error', description: 'Failed to rename category', variant: 'destructive' }) }
                            setSavingCategory(false)
                          }} disabled={savingCategory || !editCategoryName.trim() || editCategoryName.trim() === cat.name}
                            className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0">
                            {savingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingCategory(null); setEditCategoryName('') }} className="border-white/10 text-gray-400 hover:text-white">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.isPrimary ? 'bg-amber-500/20' : 'bg-sky-500/20'}`}>
                              <cat.icon className={`w-4 h-4 ${cat.isPrimary ? 'text-amber-400' : 'text-sky-400'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white text-sm font-medium">{cat.name}</span>
                                {cat.isPrimary && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">Primary</span>}
                              </div>
                              <span className="text-gray-500 text-xs">{count} product{count !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditingCategory(cat.name); setEditCategoryName(cat.name) }}
                              className="border-white/10 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400"><Edit3 className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="outline" onClick={async () => {
                              const confirmMsg = count > 0 ? `Delete "${cat.name}"?\n\nThis category has ${count} product${count !== 1 ? 's' : ''}.\n\nOK = Delete all products too\nCancel = Keep products` : `Delete empty category "${cat.name}"?`
                              if (!confirm(confirmMsg)) return
                              setSavingCategory(true)
                              try {
                                const res = await fetch('/api/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoryName: cat.name, action: 'delete' }) })
                                const data = await res.json()
                                if (res.ok) { toast({ title: 'Category Deleted', description: data.message }); fetchProducts() }
                                else { toast({ title: 'Error', description: data.error, variant: 'destructive' }) }
                              } catch { toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' }) }
                              setSavingCategory(false)
                            }} disabled={savingCategory} className="border-white/10 text-red-400 hover:bg-red-500/10 hover:border-red-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="mt-6 border-t border-white/8 pt-5">
                <p className="text-gray-400 text-xs">To add a new category, create a product and type a new category name in the category field.</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
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
                {[
                  { key: 'phone', label: 'Phone Number', icon: Phone, iconColor: 'text-green-400', placeholder: '+92 300 1234567' },
                  { key: 'whatsapp', label: 'WhatsApp Number', icon: MessageCircle, iconColor: 'text-green-400', placeholder: '+92 300 1234567' },
                  { key: 'email', label: 'Email Address', icon: Mail, iconColor: 'text-sky-400', placeholder: 'info@zilver.co' },
                  { key: 'instagram', label: 'Instagram', icon: Instagram, iconColor: 'text-pink-400', placeholder: '@zilver.co' },
                  { key: 'facebook', label: 'Facebook Page URL', icon: Facebook, iconColor: 'text-sky-500', placeholder: 'https://facebook.com/zilver' },
                  { key: 'youtube', label: 'YouTube Channel URL', icon: Youtube, iconColor: 'text-red-400', placeholder: 'https://youtube.com/@zilver' },
                ].map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label className="text-gray-300 text-sm flex items-center gap-2">
                      <field.icon className={`w-4 h-4 ${field.iconColor}`} />{field.label}
                    </Label>
                    <Input value={settingsForm[field.key as keyof SiteSettings] || ''}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500" />
                  </div>
                ))}
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-gray-300 text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400" />Address</Label>
                  <Textarea value={settingsForm.address} onChange={(e) => setSettingsForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Your business address" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500 min-h-[80px]" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-gray-300 text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-sky-400" />Business Hours</Label>
                  <p className="text-[11px] text-gray-500 mb-1">Use | to separate lines. Example: Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed</p>
                  <Textarea value={settingsForm.businessHours} onChange={(e) => setSettingsForm(prev => ({ ...prev, businessHours: e.target.value }))}
                    placeholder="Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500 min-h-[60px]" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-gray-300 text-sm flex items-center gap-2"><Navigation className="w-4 h-4 text-green-400" />Google Maps Location URL</Label>
                  <p className="text-[11px] text-gray-500 mb-1">Go to Google Maps → Find your shop → Click Share → Copy the link</p>
                  <Input value={settingsForm.mapUrl} onChange={(e) => setSettingsForm(prev => ({ ...prev, mapUrl: e.target.value }))}
                    placeholder="https://www.google.com/maps/place/..." className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500" />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveSettings} disabled={savingSettings} className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0 min-w-[160px]">
                  {savingSettings ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Settings</>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {adminTab === 'reviews' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Reviews</h2>
              <Button onClick={() => openReviewDialog()} className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0">
                <Plus className="w-4 h-4 mr-2" />Add Review
              </Button>
            </div>
            {reviews.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
                <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No Reviews Yet</h3>
                <p className="text-gray-600 mb-6">Add your first customer review.</p>
                <Button onClick={() => openReviewDialog()} className="bg-gradient-to-r from-sky-700 to-sky-500 text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />Add Review
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-700/30 to-sky-500/30 border border-white/10 flex items-center justify-center text-sky-400 font-bold text-sm">
                            {review.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white text-sm font-semibold">{review.name}</div>
                            {review.date && <div className="text-gray-500 text-xs">{review.date}</div>}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${review.approved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                          {review.approved ? 'Approved' : 'Hidden'}
                        </span>
                      </div>
                      <div className="flex gap-0.5 mb-3">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-3 mb-4">&ldquo;{review.comment}&rdquo;</p>
                      <div className="flex gap-2">
                        <Button onClick={() => toggleReviewApproval(review)} variant="outline" size="sm"
                          className={`flex-1 border-white/10 ${review.approved ? 'text-amber-400 hover:bg-amber-500/10 hover:border-amber-400' : 'text-green-400 hover:bg-green-500/10 hover:border-green-400'}`}>
                          {review.approved ? 'Hide' : 'Approve'}
                        </Button>
                        <Button onClick={() => openReviewDialog(review)} variant="outline" size="sm"
                          className="border-white/10 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400">
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button onClick={() => setDeleteReviewConfirm(review.id)} variant="outline" size="sm"
                          className="border-white/10 text-red-400 hover:bg-red-500/10 hover:border-red-400">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
              {editingProduct ? <><Edit3 className="w-5 h-5 text-sky-500" />Edit Product</> : <><Plus className="w-5 h-5 text-sky-500" />Add New Product</>}
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
                    <Button onClick={() => setFormData(prev => ({ ...prev, image: '' }))} variant="destructive" size="sm" className="absolute top-2 right-2"><X className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-sky-600/50 transition-colors cursor-pointer py-8 bg-white/3">
                    {uploading ? <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-2" /> : <Upload className="w-8 h-8 text-gray-500 mb-2" />}
                    <span className="text-sm text-gray-400">{uploading ? 'Uploading...' : 'Click to upload main image'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>
            </div>

            {/* Extra Images */}
            <div>
              <Label className="text-gray-300 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-sky-500" />Additional Images ({formData.images.length})</Label>
              <div className="mt-2">
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden border border-white/10 group/img">
                        <img src={img} alt={`Extra ${i + 1}`} className="w-full aspect-square object-cover" />
                        <button onClick={() => removeExtraImage(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-sky-600/50 transition-colors cursor-pointer py-6 bg-white/3">
                  {uploadingExtra ? <Loader2 className="w-6 h-6 text-sky-500 animate-spin mb-2" /> : <Plus className="w-6 h-6 text-gray-500 mb-2" />}
                  <span className="text-sm text-gray-400">{uploadingExtra ? 'Uploading...' : 'Click to add more images'}</span>
                  <input ref={extraImageInputRef} type="file" accept="image/*" multiple onChange={handleExtraImagesUpload} className="hidden" disabled={uploadingExtra} />
                </label>
              </div>
            </div>

            {/* Product Name */}
            <div>
              <Label className="text-gray-300">Product Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Luxury Vanity Unit"
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-600" />
            </div>

            {/* Video Upload */}
            <div>
              <Label className="text-gray-300 flex items-center gap-2"><Film className="w-4 h-4 text-sky-400" />Product Video (Optional)</Label>
              <div className="mt-2">
                {formData.video ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <video src={formData.video} controls className="w-full aspect-video object-contain bg-black/50" />
                    <div className="flex gap-2 mt-2">
                      <Button onClick={() => setFormData(prev => ({ ...prev, video: '' }))} variant="destructive" size="sm" className="text-xs"><X className="w-3 h-3 mr-1" />Remove Video</Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-sky-500/50 transition-colors cursor-pointer py-6 bg-white/3">
                    {uploadingVideo ? <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-2" /> : <Video className="w-8 h-8 text-gray-500 mb-2" />}
                    <span className="text-sm text-gray-400">{uploadingVideo ? 'Uploading video...' : 'Click to upload video'}</span>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" disabled={uploadingVideo} />
                  </label>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="text-gray-300">Description *</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe your product..." rows={3}
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-600" />
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Price *</Label>
                <Input value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} placeholder="e.g. Rs. 18,500"
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-600" />
              </div>
              <div>
                <Label className="text-gray-300">Category</Label>
                <div className="mt-2 flex gap-2">
                  <select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="flex-1 rounded-md border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none">
                    {CATEGORIES.map(cat => <option key={cat.name} value={cat.name} className="bg-[#0d1220] text-white">{cat.name}{cat.isPrimary ? ' ⭐ Primary' : ''}</option>)}
                  </select>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowCustomCategory(true)}
                    className="shrink-0 border-sky-500/30 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400"><Plus className="w-4 h-4" /></Button>
                </div>
                {showCustomCategory && (
                  <div className="mt-2 flex gap-2">
                    <Input value={customCategoryInput} onChange={(e) => setCustomCategoryInput(e.target.value)} placeholder="Type new category name..."
                      className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500"
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
                    <Button type="button" size="sm" onClick={() => {
                      if (customCategoryInput.trim()) {
                        setFormData(prev => ({ ...prev, category: customCategoryInput.trim() }))
                        setCustomCategoryInput('')
                        setShowCustomCategory(false)
                        toast({ title: 'Category Added', description: `"${customCategoryInput.trim()}" will appear when you save this product.` })
                      }
                    }} className="shrink-0 bg-gradient-to-r from-sky-500 to-sky-600 text-white border-0">Add</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setShowCustomCategory(false); setCustomCategoryInput('') }} className="shrink-0 text-gray-500 hover:text-white"><X className="w-4 h-4" /></Button>
                  </div>
                )}
              </div>
            </div>

            {/* Discount Section */}
            <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2"><Tag className="w-4 h-4 text-red-400" /><Label className="text-gray-300 font-semibold">Discount / Sale</Label></div>
              <p className="text-xs text-gray-500">Set 0 for no discount, or enter a percentage (1-90%) to put this product on sale.</p>
              <div>
                <Label className="text-gray-300">Discount Percentage</Label>
                <div className="mt-2 flex items-center gap-3">
                  <Input type="number" min={0} max={90} value={formData.discountPercent || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: Math.min(90, Math.max(0, parseInt(e.target.value) || 0)) }))}
                    placeholder="0 = no discount" className="flex-1 bg-white/5 border-red-500/30 text-white placeholder:text-gray-600 focus:border-red-500" />
                  <span className="text-gray-400 text-lg font-bold">%</span>
                </div>
              </div>
              {formData.discountPercent > 0 && formData.price && (
                <div className="rounded-lg bg-black/30 border border-white/5 p-3 space-y-2">
                  <p className="text-xs text-gray-500 font-medium">Live Preview:</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">{calcDiscountedPrice(formData.price, formData.discountPercent)}</span>
                    <span className="text-sm text-gray-500 line-through">{formData.price}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">-{formData.discountPercent}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Featured & Order */}
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="flex items-center gap-3">
                <Switch checked={formData.featured} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))} />
                <Label className="text-gray-300">Featured Product</Label>
              </div>
              <div>
                <Label className="text-gray-300">Display Order</Label>
                <Input type="number" value={formData.order} onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-600" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowProductDialog(false)} variant="outline" className="border-white/10 text-gray-300 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveProduct} disabled={saving} className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {editingProduct ? 'Update' : 'Save'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-[#0d1220] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2"><Trash2 className="w-5 h-5 text-red-400" />Delete Product</DialogTitle>
            <DialogDescription className="text-gray-400">Are you sure you want to delete this product? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeleteConfirm(null)} variant="outline" className="border-white/10 text-gray-300 hover:text-white">Cancel</Button>
            <Button onClick={() => deleteConfirm && handleDeleteProduct(deleteConfirm)} variant="destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="bg-[#0d1220] border-white/10 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {editingReview ? <><Edit3 className="w-5 h-5 text-sky-500" />Edit Review</> : <><Plus className="w-5 h-5 text-sky-500" />Add New Review</>}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingReview ? 'Update the review details.' : 'Add a customer review.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Customer Name *</Label>
              <Input value={reviewForm.name} onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Ahmed Khan"
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-600" />
            </div>
            <div>
              <Label className="text-gray-300">Rating (1-5 stars)</Label>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewForm(prev => ({ ...prev, rating: s }))}
                      className="transition-transform hover:scale-110">
                      <Star className={`w-7 h-7 ${s <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                    </button>
                  ))}
                </div>
                <span className="text-gray-400 text-sm">{reviewForm.rating}/5</span>
              </div>
            </div>
            <div>
              <Label className="text-gray-300">Review Comment *</Label>
              <Textarea value={reviewForm.comment} onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} placeholder="What did the customer say?" rows={4}
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Date</Label>
                <Input value={reviewForm.date} onChange={(e) => setReviewForm(prev => ({ ...prev, date: e.target.value }))} placeholder="e.g. January 2025"
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-600" />
              </div>
              <div>
                <Label className="text-gray-300">Display Order</Label>
                <Input type="number" value={reviewForm.order} onChange={(e) => setReviewForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-600" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={reviewForm.approved} onCheckedChange={(checked) => setReviewForm(prev => ({ ...prev, approved: checked }))} />
              <Label className="text-gray-300">Approved (visible on website)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowReviewDialog(false)} variant="outline" className="border-white/10 text-gray-300 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveReview} disabled={savingReview} className="bg-gradient-to-r from-sky-700 to-sky-500 hover:from-sky-600 hover:to-sky-400 text-white border-0">
              {savingReview ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {editingReview ? 'Update' : 'Save'} Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Review Confirmation */}
      <Dialog open={!!deleteReviewConfirm} onOpenChange={() => setDeleteReviewConfirm(null)}>
        <DialogContent className="bg-[#0d1220] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2"><Trash2 className="w-5 h-5 text-red-400" />Delete Review</DialogTitle>
            <DialogDescription className="text-gray-400">Are you sure you want to delete this review? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeleteReviewConfirm(null)} variant="outline" className="border-white/10 text-gray-300 hover:text-white">Cancel</Button>
            <Button onClick={() => deleteReviewConfirm && handleDeleteReview(deleteReviewConfirm)} variant="destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
