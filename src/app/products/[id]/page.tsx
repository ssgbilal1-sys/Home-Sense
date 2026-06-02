import { Metadata } from 'next'
import ProductDetailClient from './ProductDetailClient'

const siteUrl = 'https://sense-pk.vercel.app'

// Generate metadata for each product page (SEO)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  
  try {
    const res = await fetch(`${siteUrl}/api/products/${id}`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('Product not found')
    const product = await res.json()

    return {
      title: `${product.name} | HOME SENSE - Premium Sanitary Ware`,
      description: `${product.description || `Buy ${product.name} at ${product.price}. Authorized & Trusted Dealer of Zilver Sanitary Ware in Pakistan.`}`,
      keywords: [
        product.name,
        product.category,
        'Home Sense',
        'Zilver',
        'Sanitary Ware Pakistan',
        `${product.category} Pakistan`,
        'Buy Online',
      ],
      openGraph: {
        title: `${product.name} | HOME SENSE`,
        description: `${product.description || `Premium ${product.category} at ${product.price}`}`,
        url: `${siteUrl}/products/${id}`,
        siteName: 'HOME SENSE',
        images: product.image ? [
          {
            url: product.image,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ] : [],
        locale: 'en_PK',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | HOME SENSE`,
        description: `${product.description || `Premium ${product.category} at ${product.price}`}`,
        images: product.image ? [product.image] : [],
      },
      alternates: {
        canonical: `${siteUrl}/products/${id}`,
      },
    }
  } catch (e) {
    return {
      title: 'Product Not Found | HOME SENSE',
      description: 'The product you are looking for could not be found. Browse our complete range of premium sanitary ware.',
    }
  }
}

// Generate static params for all products
export async function generateStaticParams() {
  try {
    const res = await fetch(`${siteUrl}/api/products`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const products = await res.json()
    return products.map((product: any) => ({
      id: product.id,
    }))
  } catch (e) {
    return []
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProductDetailClient productId={id} />
}
