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
  title: 'Market Tape — Cloud & Capital',
  description:
    'Morning market dashboard for FinOps, cloud finance, and tech infrastructure teams.',
  openGraph: {
    title: 'Market Tape — Cloud & Capital',
    description: 'Morning market intelligence for FinOps and cloud infrastructure teams.',
    url: 'https://market-tape.cloudandcapital.com',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Market Tape — Cloud & Capital',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg?v=4', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=4', sizes: 'any' },
    ],
    shortcut: '/favicon.ico?v=4',
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
