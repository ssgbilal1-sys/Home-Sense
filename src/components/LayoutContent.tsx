'use client'

import { ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PixelInjector from '@/components/PixelInjector'

export default function LayoutContent({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PixelInjector />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
