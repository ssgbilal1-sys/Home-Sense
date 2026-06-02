import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://sense-pk.vercel.app"

export const metadata: Metadata = {
  title: "HOME SENSE - Authorized & Trusted Dealer | Premium Sanitary Ware Pakistan",
  description: "Home Sense is the Authorized & Trusted Dealer of Zilver Sanitary Ware in Pakistan. Shop premium vanities, commodes, basins, shower sets & art bowls. Factory-direct pricing, quality guaranteed.",
  keywords: [
    "Home Sense", "Zilver Sanitary Ware", "Sanitary Ware Pakistan",
    "Bathroom Vanities Pakistan", "Commode Price Pakistan", "Wash Basin Pakistan",
    "Shower Sets Pakistan", "Art Bowls Pakistan", "Bathroom Solutions",
    "Authorized Dealer Zilver", "Trusted Dealer", "Premium Sanitary Ware",
    "Bathroom Accessories", "Kitchen Faucets Pakistan", "Vanity Manufacturer Pakistan"
  ],
  icons: {
    icon: "/logo-homesense.jpg",
  },
  openGraph: {
    title: "HOME SENSE - Authorized & Trusted Dealer | Premium Sanitary Ware",
    description: "Shop premium vanities, commodes, basins, shower sets & art bowls. Authorized & Trusted Dealer of Zilver Sanitary Ware in Pakistan.",
    url: siteUrl,
    siteName: "HOME SENSE",
    images: [
      {
        url: `${siteUrl}/logo-homesense.jpg`,
        width: 1200,
        height: 630,
        alt: "HOME SENSE - Premium Sanitary Ware Pakistan",
      },
    ],
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HOME SENSE - Authorized & Trusted Dealer | Premium Sanitary Ware",
    description: "Shop premium vanities, commodes, basins, shower sets & art bowls. Quality guaranteed.",
    images: [`${siteUrl}/logo-homesense.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-PK" suppressHydrationWarning>
      <head>
        <meta name="geo.region" content="PK" />
        <meta name="geo.country" content="Pakistan" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
