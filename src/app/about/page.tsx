'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle, Star, Wrench, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  // Scroll-reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-reveal text-center mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              About
              <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent" style={{ backgroundSize: '200% auto' }}> Home Sense</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Your authorized & trusted dealer for premium sanitary ware solutions.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-reveal">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                All-in-One
                <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent" style={{ backgroundSize: '200% auto' }}> Sanitary Wares</span>
              </h2>
              <p className="text-gray-400 text-lg mb-4">
                Excellent details, durable components, compatible hardware result in premium quality. High standard, long life combined with superior performance thanks to the compatibility of all components, spare parts and durability.
              </p>
              <p className="text-gray-400 text-lg mb-8">
                As the authorized dealer, Home Sense brings you the finest vanities, commodes, basins, shower sets, and art bowls — with our own manufactured vanities line.
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
              <div className="relative rounded-3xl border border-white/8 overflow-hidden bg-white/3 p-8 sm:p-12">
                <div className="text-center">
                  <div className="mx-auto mb-6">
                    <img src="/logo-homesense.jpg" alt="Home Sense" loading="lazy" className="h-28 w-auto object-contain rounded-xl mx-auto" />
                  </div>
                  <h3 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent mb-2" style={{ backgroundSize: '200% auto' }}>
                    HOME SENSE
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">Sanitary Fitting & Ware</p>
                  <p className="text-gray-500 text-xs mb-8">Quality Sanitary Ware Solutions</p>
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/8 text-[10px] text-gray-400">
                      <CheckCircle className="w-3 h-3 text-sky-400" />
                      Distributed by Home Sense
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="scroll-reveal"><div className="text-center"><div className="text-2xl sm:text-3xl font-bold text-white">50+</div><div className="text-xs text-gray-500 mt-1">Projects</div></div></div>
                    <div className="scroll-reveal scroll-reveal-delay-2"><div className="text-center"><div className="text-2xl sm:text-3xl font-bold text-white">150+</div><div className="text-xs text-gray-500 mt-1">Products</div></div></div>
                    <div className="scroll-reveal scroll-reveal-delay-3"><div className="text-center"><div className="text-2xl sm:text-3xl font-bold text-white">99%</div><div className="text-xs text-gray-500 mt-1">Quality</div></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vanities Manufacturer Banner */}
      <section className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-reveal">
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
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-reveal rounded-2xl border border-white/8 bg-gradient-to-r from-sky-900/30 via-sky-800/20 to-sky-900/30 p-8 sm:p-12 text-center card-shine">
            <Star className="w-10 h-10 text-sky-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">What Our Customers Say</h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Read reviews from our satisfied customers and see why Home Sense is the trusted choice.
            </p>
            <Link href="/reviews">
              <Button size="lg" variant="outline" className="border-sky-500/30 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400">
                See All Reviews
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
