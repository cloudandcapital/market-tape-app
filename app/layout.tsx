import type { Metadata } from 'next'
import { Playfair_Display, Inter, DM_Mono } from 'next/font/google'
import './globals.css'
import SiteNav from '@/components/SiteNav'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

const dmMono = DM_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Market Tape — Morning Intelligence for FinOps Teams | Cloud & Capital',
  description:
    'Real-time market intelligence for FinOps teams. 52 instruments, $750B+ AI compute commitments tracker, and Lumen reading the tape every 30 minutes — translating market moves into FinOps decisions in plain English.',
  openGraph: {
    title: 'Market Tape — Morning Intelligence for FinOps Teams | Cloud & Capital',
    description: 'Real-time market intelligence for FinOps teams. 52 instruments, $750B+ AI compute commitments tracker, and Lumen reading the tape every 30 minutes — translating market moves into FinOps decisions in plain English.',
    url: 'https://market-tape.cloudandcapital.com',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    description: 'Real-time market intelligence for FinOps teams. 52 instruments, $750B+ AI compute commitments tracker, and Lumen reading the tape every 30 minutes — translating market moves into FinOps decisions in plain English.',
    title: 'Market Tape — Morning Intelligence for FinOps Teams | Cloud & Capital',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${dmMono.variable}`}>
      <body className="min-h-screen bg-cream text-charcoal antialiased">
        <SiteNav />
        <div className="pt-14">{children}</div>
      </body>
    </html>
  )
}
