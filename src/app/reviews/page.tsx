'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Star } from 'lucide-react'

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  approved: boolean
  order: number
}

const renderStars = (rating: number) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} className={`w-5 h-5 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
    ))}
  </div>
)

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/reviews?approved=true')
        if (res.ok) {
          const data = await res.json()
          setReviews(data)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }
    }
    load()
  }, [])

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
  }, [reviews])

  // Average rating
  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0
    return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
  }, [reviews])

  return (
    <div className="overflow-x-hidden">
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-reveal text-center mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Customer
              <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent text-shimmer"> Reviews</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              See what our customers have to say about Home Sense products and services.
            </p>
          </div>

          {/* Stats Bar */}
          {reviews.length > 0 && (
            <div className="scroll-reveal max-w-md mx-auto mb-12">
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6 text-center card-shine">
                <div className="text-5xl font-bold text-white mb-2">{avgRating}</div>
                <div className="flex justify-center mb-2">{renderStars(Math.round(Number(avgRating)))}</div>
                <p className="text-gray-500 text-sm">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}

          {/* Reviews Grid */}
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {reviews.map((review, i) => (
                <div key={review.id} className={`scroll-reveal scroll-reveal-delay-${Math.min((i % 3) + 1, 3)}`}>
                  <div className="rounded-2xl border border-white/8 bg-white/3 p-6 card-shine h-full flex flex-col">
                    <div className="mb-3">{renderStars(review.rating)}</div>
                    <p className="text-gray-300 text-sm flex-1 leading-relaxed mb-4">&ldquo;{review.comment}&rdquo;</p>
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-700/30 to-sky-500/30 border border-white/10 flex items-center justify-center text-sky-400 font-bold text-sm">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white text-sm font-semibold">{review.name}</div>
                        {review.date && <div className="text-gray-500 text-xs">{review.date}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Star className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500 mb-4">Customer reviews will appear here once added.</p>
            </div>
          )}

          {/* Google Reviews Placeholder */}
          <div className="scroll-reveal mt-16 max-w-2xl mx-auto">
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 p-8 text-center">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-700/20 to-sky-500/20 border border-white/8 flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Google Reviews</h3>
              <p className="text-gray-500 text-sm mb-4">
                Google Reviews integration coming soon! Once we set up our Google Business Profile, you&apos;ll be able to see all our Google reviews right here.
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
