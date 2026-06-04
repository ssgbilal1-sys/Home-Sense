'use client'

import { useEffect } from 'react'

interface PixelSettings {
  metaPixelId?: string
  tiktokPixelId?: string
}

export default function PixelInjector() {
  useEffect(() => {
    // Fetch settings and inject pixel scripts
    const injectPixels = async () => {
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) return
        const settings: PixelSettings = await res.json()

        // Inject Meta (Facebook) Pixel
        if (settings.metaPixelId && settings.metaPixelId.trim()) {
          const pixelId = settings.metaPixelId.trim()
          // Check if already injected
          if (document.querySelector(`script[data-meta-pixel="${pixelId}"]`)) return

          const script = document.createElement('script')
          script.setAttribute('data-meta-pixel', pixelId)
          script.textContent = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `
          document.head.appendChild(script)

          // Add noscript fallback
          const noscript = document.createElement('noscript')
          const img = document.createElement('img')
          img.height = '1'
          img.width = '1'
          img.style.display = 'none'
          img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`
          noscript.appendChild(img)
          document.body.appendChild(noscript)

          console.log('[Pixel] Meta Pixel injected:', pixelId)
        }

        // Inject TikTok Pixel
        if (settings.tiktokPixelId && settings.tiktokPixelId.trim()) {
          const tiktokId = settings.tiktokPixelId.trim()
          // Check if already injected
          if (document.querySelector(`script[data-tiktok-pixel="${tiktokId}"]`)) return

          const script = document.createElement('script')
          script.setAttribute('data-tiktok-pixel', tiktokId)
          script.textContent = `
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
              var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${tiktokId}');
              ttq.page();
            }(window, document, 'ttq');
          `
          document.head.appendChild(script)

          console.log('[Pixel] TikTok Pixel injected:', tiktokId)
        }
      } catch (error) {
        console.error('[Pixel] Failed to inject pixels:', error)
      }
    }

    injectPixels()
  }, [])

  return null // This component renders nothing visually
}
