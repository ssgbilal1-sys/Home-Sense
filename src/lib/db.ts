import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// Supabase client for server-side API routes (bypasses RLS)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Generate a CUID-like ID (compatible with Prisma's @default(cuid()))
function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = uuidv4().replace(/-/g, '').slice(0, 16)
  return `c${timestamp}${random}`.slice(0, 25)
}

// Prisma-compatible database interface using Supabase REST API
// This avoids TCP connection issues on Vercel serverless

export const db = {
  product: {
    findMany: async (opts?: { orderBy?: Record<string, string>; where?: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      let query = supabase.from('Product').select('*')
      
      if (opts?.where) {
        Object.entries(opts.where).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            // Handle operators like { contains: 'x' }
            if ('contains' in value) {
              query = query.ilike(key, `%${value.contains}%`)
            } else if ('equals' in value) {
              query = query.eq(key, value.equals)
            }
          } else {
            query = query.eq(key, value)
          }
        })
      }
      
      // Handle ordering
      if (opts?.orderBy) {
        const [field, direction] = Object.entries(opts.orderBy)[0]
        query = query.order(field as string, { ascending: direction === 'asc' })
      }
      
      const { data, error } = await query
      if (error) throw new Error(error.message)
      // Provide defaults for new columns that may not exist yet in the database
      return (data || []).map((item: any) => {
        // Check if discount has expired
        const isExpired = item.discountExpiresAt && new Date(item.discountExpiresAt) < new Date()
        return {
          discountPrice: '',
          onSale: false,
          discountPercent: 0,
          discountExpiresAt: null,
          ...item,
          // If discount expired, override to no discount
          ...(isExpired ? { discountPercent: 0, onSale: false, discountPrice: '' } : {}),
        }
      })
    },

    findUnique: async (opts: { where: { id: string } }) => {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from('Product')
        .select('*')
        .eq('id', opts.where.id)
        .single()
      if (error && error.code !== 'PGRST116') throw new Error(error.message)
      // Provide defaults for new columns that may not exist yet in the database
      if (!data) return null
      // Check if discount has expired
      const isExpired = data.discountExpiresAt && new Date(data.discountExpiresAt) < new Date()
      return {
        discountPrice: '',
        onSale: false,
        discountPercent: 0,
        discountExpiresAt: null,
        ...data,
        // If discount expired, override to no discount
        ...(isExpired ? { discountPercent: 0, onSale: false, discountPrice: '' } : {}),
      }
    },

    create: async (opts: { data: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      const dataWithDefaults = {
        discountPrice: '',
        onSale: false,
        discountPercent: 0,
        discountExpiresAt: null,
        ...opts.data,
      }
      const dataWithIdAndTimestamp = {
        ...dataWithDefaults,
        id: dataWithDefaults.id || generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const { data, error } = await supabase
        .from('Product')
        .insert(dataWithIdAndTimestamp)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    },

    update: async (opts: { where: { id: string }; data: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      const dataWithTimestamp = { ...opts.data, updatedAt: new Date().toISOString() }

      // Try full update first
      let { data, error } = await supabase
        .from('Product')
        .update(dataWithTimestamp)
        .eq('id', opts.where.id)
        .select()
        .single()

      // If column doesn't exist, remove problematic columns and retry
      if (error && (error.message?.includes('column') || error.message?.includes('does not exist') || error.code === '42703')) {
        console.warn('Product update failed with column error, retrying without optional columns:', error.message)
        const knownOptionalCols = ['discountPrice', 'onSale', 'discountPercent', 'discountExpiresAt', 'video']
        const safeData = { ...dataWithTimestamp }
        for (const col of knownOptionalCols) {
          delete safeData[col]
        }
        const retry = await supabase
          .from('Product')
          .update(safeData)
          .eq('id', opts.where.id)
          .select()
          .single()
        if (retry.error) throw new Error(retry.error.message)
        return retry.data
      }

      if (error) throw new Error(error.message)
      return data
    },

    delete: async (opts: { where: { id: string } }) => {
      const supabase = getSupabaseAdmin()
      const { error } = await supabase
        .from('Product')
        .delete()
        .eq('id', opts.where.id)
      if (error) throw new Error(error.message)
      return { id: opts.where.id }
    },

    count: async (opts?: { where?: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      let query = supabase.from('Product').select('id', { count: 'exact', head: true })
      if (opts?.where) {
        Object.entries(opts.where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      const { count, error } = await query
      if (error) throw new Error(error.message)
      return count || 0
    },
  },

  siteSettings: {
    findUnique: async (opts: { where: { id: string } }) => {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from('SiteSettings')
        .select('*')
        .eq('id', opts.where.id)
        .single()
      if (error && error.code !== 'PGRST116') throw new Error(error.message)
      // Provide defaults for new columns that may not exist yet in the database
      return {
        businessHours: 'Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed',
        mapUrl: '',
        metaPixelId: '',
        tiktokPixelId: '',
        ...data,
      }
    },

    upsert: async (opts: { where: { id: string }; update: Record<string, any>; create: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      const mergedData = { ...opts.create, ...opts.update, id: opts.where.id, updatedAt: new Date().toISOString() }

      // Try with new columns first; if they don't exist in DB yet, retry without them
      const { data, error } = await supabase
        .from('SiteSettings')
        .upsert(mergedData, { onConflict: 'id' })
        .select()
        .single()

      if (error) {
        // If column doesn't exist, try without the new columns
        if (error.message?.includes('column') || error.code === '42703') {
          const fallbackData = { ...mergedData }
          delete fallbackData.businessHours
          delete fallbackData.mapUrl
          delete fallbackData.metaPixelId
          delete fallbackData.tiktokPixelId
          const { data: fallbackResult, error: fallbackError } = await supabase
            .from('SiteSettings')
            .upsert(fallbackData, { onConflict: 'id' })
            .select()
            .single()
          if (fallbackError) throw new Error(fallbackError.message)
          return {
            businessHours: 'Mon-Sat: 10:00 AM - 8:00 PM|Sunday: Closed',
            mapUrl: '',
            metaPixelId: '',
            tiktokPixelId: '',
            ...fallbackResult,
          }
        }
        throw new Error(error.message)
      }
      return data
    },

    create: async (opts: { data: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      const dataWithIdAndTimestamp = {
        ...opts.data,
        id: opts.data.id || 'main',
        updatedAt: new Date().toISOString()
      }
      const { data, error } = await supabase
        .from('SiteSettings')
        .insert(dataWithIdAndTimestamp)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    },
  },

  review: {
    findMany: async (opts?: { orderBy?: Record<string, string>; where?: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      let query = supabase.from('Review').select('*')

      if (opts?.where) {
        Object.entries(opts.where).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            if ('equals' in value) {
              query = query.eq(key, value.equals)
            }
          } else {
            query = query.eq(key, value)
          }
        })
      }

      if (opts?.orderBy) {
        const [field, direction] = Object.entries(opts.orderBy)[0]
        query = query.order(field as string, { ascending: direction === 'asc' })
      }

      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data || []
    },

    findUnique: async (opts: { where: { id: string } }) => {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from('Review')
        .select('*')
        .eq('id', opts.where.id)
        .single()
      if (error && error.code !== 'PGRST116') throw new Error(error.message)
      return data
    },

    create: async (opts: { data: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      const dataWithIdAndTimestamp = {
        ...opts.data,
        id: opts.data.id || generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const { data, error } = await supabase
        .from('Review')
        .insert(dataWithIdAndTimestamp)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    },

    update: async (opts: { where: { id: string }; data: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      const dataWithTimestamp = { ...opts.data, updatedAt: new Date().toISOString() }
      const { data, error } = await supabase
        .from('Review')
        .update(dataWithTimestamp)
        .eq('id', opts.where.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    },

    delete: async (opts: { where: { id: string } }) => {
      const supabase = getSupabaseAdmin()
      const { error } = await supabase
        .from('Review')
        .delete()
        .eq('id', opts.where.id)
      if (error) throw new Error(error.message)
      return { id: opts.where.id }
    },
  },

  productReview: {
    findMany: async (opts?: { orderBy?: Record<string, string>; where?: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      let query = supabase.from('ProductReview').select('*')

      if (opts?.where) {
        Object.entries(opts.where).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            if ('equals' in value) {
              query = query.eq(key, value.equals)
            }
          } else {
            query = query.eq(key, value)
          }
        })
      }

      if (opts?.orderBy) {
        const [field, direction] = Object.entries(opts.orderBy)[0]
        query = query.order(field as string, { ascending: direction === 'asc' })
      }

      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data || []
    },

    findUnique: async (opts: { where: { id: string } }) => {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from('ProductReview')
        .select('*')
        .eq('id', opts.where.id)
        .single()
      if (error && error.code !== 'PGRST116') throw new Error(error.message)
      return data
    },

    create: async (opts: { data: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      const dataWithIdAndTimestamp = {
        ...opts.data,
        id: opts.data.id || generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const { data, error } = await supabase
        .from('ProductReview')
        .insert(dataWithIdAndTimestamp)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    },

    update: async (opts: { where: { id: string }; data: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      const dataWithTimestamp = { ...opts.data, updatedAt: new Date().toISOString() }
      const { data, error } = await supabase
        .from('ProductReview')
        .update(dataWithTimestamp)
        .eq('id', opts.where.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    },

    delete: async (opts: { where: { id: string } }) => {
      const supabase = getSupabaseAdmin()
      const { error } = await supabase
        .from('ProductReview')
        .delete()
        .eq('id', opts.where.id)
      if (error) throw new Error(error.message)
      return { id: opts.where.id }
    },

    count: async (opts?: { where?: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      let query = supabase.from('ProductReview').select('id', { count: 'exact', head: true })
      if (opts?.where) {
        Object.entries(opts.where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      const { count, error } = await query
      if (error) throw new Error(error.message)
      return count || 0
    },
  },
}
