import { createClient } from '@supabase/supabase-js'

// Supabase client for server-side API routes (bypasses RLS)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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
      return data || []
    },

    findUnique: async (opts: { where: { id: string } }) => {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from('Product')
        .select('*')
        .eq('id', opts.where.id)
        .single()
      if (error && error.code !== 'PGRST116') throw new Error(error.message)
      return data
    },

    create: async (opts: { data: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      const dataWithTimestamp = { ...opts.data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      const { data, error } = await supabase
        .from('Product')
        .insert(dataWithTimestamp)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    },

    update: async (opts: { where: { id: string }; data: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      const dataWithTimestamp = { ...opts.data, updatedAt: new Date().toISOString() }
      const { data, error } = await supabase
        .from('Product')
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
      return data
    },

    upsert: async (opts: { where: { id: string }; update: Record<string, any>; create: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      const mergedData = { ...opts.create, ...opts.update, id: opts.where.id, updatedAt: new Date().toISOString() }
      const { data, error } = await supabase
        .from('SiteSettings')
        .upsert(mergedData, { onConflict: 'id' })
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    },

    create: async (opts: { data: Record<string, any> }) => {
      const supabase = getSupabaseAdmin()
      const dataWithTimestamp = { ...opts.data, updatedAt: new Date().toISOString() }
      const { data, error } = await supabase
        .from('SiteSettings')
        .insert(dataWithTimestamp)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    },
  },
}
