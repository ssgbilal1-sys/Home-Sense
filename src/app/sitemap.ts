import { MetadataRoute } from 'next'

const siteUrl = 'https://sense-pk.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/#products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/#about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/#contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${siteUrl}/api/products`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const products = await res.json()
      productPages = products.map((product: any) => ({
        url: `${siteUrl}/products/${product.id}`,
        lastModified: new Date(product.updatedAt || product.createdAt || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch (e) {
    // If fetch fails, just return static pages
  }

  return [...staticPages, ...productPages]
}
