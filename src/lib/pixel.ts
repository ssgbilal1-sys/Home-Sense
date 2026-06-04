// Pixel Event Tracking Utility
// Tracks events for Meta Pixel and TikTok Pixel

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
    ttq?: {
      track: (event: string, params?: Record<string, any>) => void
      page: () => void
    }
  }
}

// Track a contact event (WhatsApp click, phone call, etc.)
export function trackContact(method: string = 'whatsapp') {
  try {
    // Meta Pixel - Contact event
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Contact', { content_name: method })
    }
    // TikTok Pixel - Contact event
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('Contact', { content_name: method })
    }
  } catch (e) {
    // Silently fail — don't break user experience
  }
}

// Track a product view
export function trackViewContent(productName: string, category: string, price?: string) {
  try {
    // Meta Pixel - ViewContent event
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: productName,
        content_category: category,
        value: price ? parseFloat(price.replace(/[^0-9.]/g, '')) || undefined : undefined,
        currency: 'PKR',
      })
    }
    // TikTok Pixel - ViewContent event
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('ViewContent', {
        content_name: productName,
        content_category: category,
      })
    }
  } catch (e) {
    // Silently fail
  }
}

// Track InitiateCheckout (for "Get Directions" or serious intent)
export function trackInitiateCheckout(action: string = 'directions') {
  try {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', { content_name: action })
    }
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('InitiateCheckout', { content_name: action })
    }
  } catch (e) {
    // Silently fail
  }
}
