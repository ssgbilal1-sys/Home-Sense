'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets, Menu, X, Plus, Trash2, Edit3,
  Upload, Save, ChevronRight, Phone, Mail,
  ArrowRight, Eye, Settings, Shield,
  Facebook, Instagram, Youtube, MessageCircle,
  Wrench, Bath, ShowerHead, CookingPot,
  Star, CheckCircle, Loader2, Package
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
  category: string
  featured: boolean
  order: number
  createdAt: string
  updatedAt: string
}

type ViewMode = 'storefront' | 'admin'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('storefront')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  // Product form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'Bathroom',
    featured: true,
    order: 0,
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { toast } = useToast()

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

  // Admin login handler
  const handleAdminLogin = () => {
    if (adminPassword === 'zilver2024') {
      setIsAdminAuthenticated(true)
      setShowAdminLogin(false)
      setViewMode('admin')
      setAdminPassword('')
      toast({ title: 'Welcome Admin!', description: 'You can now manage your products.' })
    } else {
      toast({ title: 'Wrong Password', description: 'Please enter the correct admin password.', variant: 'destructive' })
    }
  }

  // Image upload handler
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
        toast({ title: 'Image Uploaded', description: 'Product image uploaded successfully.' })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({ title: 'Upload Failed', description: 'Failed to upload image.', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  // Open product dialog for add/edit
  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name, description: product.description, price: product.price,
        image: product.image, category: product.category, featured: product.featured, order: product.order,
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '', description: '', price: '', image: '',
        category: 'Bathroom', featured: true, order: products.length + 1,
      })
    }
    setShowProductDialog(true)
  }

  // Save product
  const handleSaveProduct = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.image) {
      toast({ title: 'Missing Fields', description: 'Please fill in all required fields.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
        })
        toast({ title: 'Product Updated', description: `${formData.name} has been updated.` })
      } else {
        await fetch('/api/products', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
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

  // Category icons mapping
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'wash basins': return Bath
      case 'tap & mixers': return Wrench
      case 'showers': return ShowerHead
      case 'commode': return Package
      case 'kitchen': return CookingPot
      default: return Droplets
    }
  }

  // ───────────────────────────────────────────────────────
  // STOREFRONT VIEW
  // ───────────────────────────────────────────────────────

  if (viewMode === 'storefront') {
    return (
      <div className="min-h-screen flex flex-col bg-[#080c14] text-white overflow-x-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[180px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Navigation */}
        <nav className="relative z-50 border-b border-white/8 backdrop-blur-xl bg-[#080c14]/85">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 sm:gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent tracking-wide">
                  ZILVER
                </span>
              </motion.div>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-8">
                <a href="#home" className="text-sm text-gray-300 hover:text-white transition-colors">Home</a>
                <a href="#products" className="text-sm text-gray-300 hover:text-white transition-colors">Products</a>
                <a href="#about" className="text-sm text-gray-300 hover:text-white transition-colors">About</a>
                <a href="#contact" className="text-sm text-gray-300 hover:text-white transition-colors">Contact</a>
                <Button
                  onClick={() => {
                    if (isAdminAuthenticated) setViewMode('admin')
                    else setShowAdminLogin(true)
                  }}
                  variant="outline"
                  size="sm"
                  className="border-white/15 text-gray-300 hover:text-white hover:border-blue-400 hover:bg-blue-500/10"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Admin
                </Button>
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

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-white/8 bg-[#080c14]/95 backdrop-blur-xl"
              >
                <div className="px-4 py-4 space-y-3">
                  <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Home</a>
                  <a href="#products" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Products</a>
                  <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">About</a>
                  <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Contact</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Section */}
        <section id="home" className="relative z-10 flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Quality Bathroom & Kitchen Solutions</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6">
                  Innovative,
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent"> Efficient</span>
                  <br />& Elegant
                </h1>
                <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-lg">
                  Concetti Italiano — Sanitary Wares. We have complete range of solutions for day to day living in the bathroom, public and private places.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="#products">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-0 shadow-lg shadow-blue-500/25">
                      <Package className="w-5 h-5 mr-2" />
                      Explore Products
                    </Button>
                  </a>
                  <a href="#contact">
                    <Button size="lg" variant="outline" className="border-white/20 text-gray-300 hover:text-white hover:border-white/40">
                      Contact Us
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="relative w-full aspect-square max-w-md mx-auto">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-600/25 to-cyan-500/25 blur-3xl" />
                  <div className="relative rounded-3xl overflow-hidden border border-white/10">
                    <img src="/logo-zilver.png" alt="Zilver Brand" className="w-full h-full object-cover" />
                  </div>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-4 shadow-xl"
                  >
                    <Droplets className="w-6 h-6 text-white" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                    className="absolute -bottom-4 -left-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-4 shadow-xl"
                  >
                    <CheckCircle className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Category Quick Links */}
        <section className="relative z-10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'Tap & Mixers', icon: Wrench, count: '134' },
                { name: 'Wash Basins', icon: Bath, count: '45' },
                { name: 'Showers', icon: ShowerHead, count: '36' },
                { name: 'Kitchen', icon: CookingPot, count: '9' },
              ].map((cat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-blue-500/30 transition-all duration-300 p-5 text-center">
                    <cat.icon className="w-8 h-8 mx-auto mb-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-white text-sm mb-1">{cat.name}</h3>
                    <span className="text-xs text-gray-500">{cat.count} Products</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="relative z-10 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Featured
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Products</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                The Zilver Concetti Italiano has multifaceted solutions for the modern bathroom — versatile faucets, head showers, washbasins and more.
              </p>
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="group"
                  >
                    <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/8 hover:border-blue-500/40 transition-all duration-500">
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        {/* Category badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-600/80 to-cyan-500/80 backdrop-blur-sm text-white flex items-center gap-1">
                            {(() => { const Icon = getCategoryIcon(product.category); return <Icon className="w-3 h-3" /> })()}
                            {product.category}
                          </span>
                        </div>
                        {/* Quick view overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            {product.price}
                          </span>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-0 shadow-md shadow-blue-500/20"
                          >
                            Get Quote
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Why Zilver Section */}
        <section id="about" className="relative z-10 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  All-in-One
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Sanitary Wares</span>
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  Excellent details, durable components, compatible hardware result in Zilver quality. High standard, long life combined with Zilver mixers superior performance thanks to the compatibility of all components, spare parts and durability.
                </p>
                <div className="space-y-6">
                  {[
                    { icon: CheckCircle, title: 'Quality Standards', desc: 'Carefully engineered, all parts complying with international standards. Premium materials built to last.' },
                    { icon: Star, title: 'Innovative Design', desc: 'Modern multifaceted solutions with aesthetically appealing and functional products that match your lifestyle.' },
                    { icon: Wrench, title: 'Spare Parts Available', desc: 'Long-term performance guaranteed with full compatibility of all components and readily available spare parts.' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 }}
                      className="flex gap-4"
                    >
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-white/8 flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-600/15 to-cyan-500/15 blur-2xl" />
                <div className="relative rounded-3xl border border-white/8 overflow-hidden bg-white/3 p-8 sm:p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mb-6">
                      <Droplets className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                      ZILVER
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">Concetti Italiano</p>
                    <p className="text-gray-500 text-xs mb-8">Quality Bathroom & Kitchen Solutions</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-white">500+</div>
                        <div className="text-xs text-gray-500 mt-1">Projects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-white">300+</div>
                        <div className="text-xs text-gray-500 mt-1">Products</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
                        <div className="text-xs text-gray-500 mt-1">Quality</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="relative z-10 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Get in
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Touch</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Have a question or need a quote? We would love to hear from you.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-8 sm:p-12">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: Phone, label: 'Call Us', value: '+92 300 1234567', color: 'from-green-500/20 to-green-600/20 border-green-500/20', iconColor: 'text-green-400' },
                    { icon: MessageCircle, label: 'WhatsApp', value: '+92 300 1234567', color: 'from-green-500/20 to-green-600/20 border-green-500/20', iconColor: 'text-green-400' },
                    { icon: Instagram, label: 'Instagram', value: '@zilver.co', color: 'from-pink-500/20 to-purple-600/20 border-pink-500/20', iconColor: 'text-pink-400' },
                    { icon: Mail, label: 'Email', value: 'info@zilver.co', color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/20', iconColor: 'text-cyan-400' },
                  ].map((contact, i) => (
                    <a key={i} href="#" className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${contact.color} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <contact.icon className={`w-5 h-5 ${contact.iconColor}`} />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-white text-xs">{contact.label}</div>
                        <div className="text-gray-500 text-[10px] mt-0.5">{contact.value}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/8 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  ZILVER
                </span>
                <span className="text-xs text-gray-600 ml-2">Quality Bathroom & Kitchen Solutions</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors"><Facebook className="w-4 h-4" /></a>
                <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors"><Instagram className="w-4 h-4" /></a>
                <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors"><Youtube className="w-4 h-4" /></a>
              </div>
              <p className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} Zilver. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Admin Login Dialog */}
        <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
          <DialogContent className="bg-[#0d1220] border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Admin Access
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter the admin password to manage your products.
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
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <p className="text-xs text-gray-500">
                Demo password: <span className="text-blue-400 font-mono">zilver2024</span>
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleAdminLogin} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-0">
                <ChevronRight className="w-4 h-4 mr-1" />
                Login
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
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Zilver Admin</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Manage your products</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setViewMode('storefront')}
                variant="outline" size="sm"
                className="border-white/15 text-gray-300 hover:text-white hover:border-blue-400 hover:bg-blue-500/10"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Store
              </Button>
              <Button
                onClick={() => { setIsAdminAuthenticated(false); setViewMode('storefront') }}
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
            { label: 'Total Products', value: products.length, color: 'from-blue-500 to-blue-600' },
            { label: 'Featured', value: products.filter(p => p.featured).length, color: 'from-cyan-500 to-cyan-600' },
            { label: 'Categories', value: [...new Set(products.map(p => p.category))].length, color: 'from-teal-500 to-teal-600' },
            { label: 'Store Status', value: 'Live', color: 'from-green-500 to-green-600' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-white/8 bg-white/3 p-4"
            >
              <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Products Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Products</h2>
          <Button
            onClick={() => openProductDialog()}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No Products Yet</h3>
            <p className="text-gray-600 mb-6">Add your first product to get started.</p>
            <Button onClick={() => openProductDialog()} className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden hover:border-blue-500/30 transition-colors group">
                  {/* Product Image */}
                  <div className="relative aspect-video overflow-hidden bg-black/30">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 flex gap-1">
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
                        <span className="text-xs text-cyan-400">{product.category}</span>
                      </div>
                      <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {product.price}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.description}</p>
                    <div className="flex gap-2">
                      <Button onClick={() => openProductDialog(product)} variant="outline" size="sm"
                        className="flex-1 border-white/10 text-gray-300 hover:text-white hover:border-blue-400 hover:bg-blue-500/10">
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
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="bg-[#0d1220] border-white/10 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {editingProduct ? (
                <><Edit3 className="w-5 h-5 text-blue-400" /> Edit Product</>
              ) : (
                <><Plus className="w-5 h-5 text-blue-400" /> Add New Product</>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingProduct ? 'Update product details below.' : 'Fill in the details to add a new product.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <Label className="text-gray-300">Product Image *</Label>
              <div className="mt-2">
                {formData.image ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img src={formData.image} alt="Preview" className="w-full aspect-video object-cover" />
                    <Button onClick={() => setFormData(prev => ({ ...prev, image: '' }))} variant="destructive" size="sm" className="absolute top-2 right-2">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/50 transition-colors cursor-pointer py-8 bg-white/3">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-500 mb-2" />
                    )}
                    <span className="text-sm text-gray-400">{uploading ? 'Uploading...' : 'Click to upload image'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>
            </div>

            {/* Product Name */}
            <div>
              <Label className="text-gray-300">Product Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Zilver Art Wash Basin"
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-blue-500/20" />
            </div>

            {/* Description */}
            <div>
              <Label className="text-gray-300">Description *</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your product..." rows={3}
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-blue-500/20" />
            </div>

            {/* Price & Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Price *</Label>
                <Input value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g. Rs. 18,500"
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-blue-500/20" />
              </div>
              <div>
                <Label className="text-gray-300">Category</Label>
                <Input value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. Wash Basins"
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-blue-500/20" />
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
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-blue-500/20" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowProductDialog(false)} variant="outline" className="border-white/10 text-gray-300 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleSaveProduct} disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-0">
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
