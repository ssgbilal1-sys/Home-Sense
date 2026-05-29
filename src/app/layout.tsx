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

export const metadata: Metadata = {
  title: "HOME SENSE - Authorized Distributor of Zilver Sanitary Ware",
  description: "Home Sense is the authorized distributor of Zilver Concetti Italiano Sanitary Wares. Complete range of bathroom & kitchen solutions — faucets, showers, wash basins, and more.",
  keywords: ["Home Sense", "Zilver", "Sanitary Ware", "Bathroom Solutions", "Kitchen Solutions", "Faucets", "Showers", "Wash Basins", "Authorized Distributor"],
  icons: {
    icon: "/logo-homesense.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
