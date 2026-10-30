import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import './color-mode.css'
import './editorial.css'
import { themeBootstrap } from '@/lib/color-mode'
import SiteNav from '@/components/SiteNav'

const playfair = Cormorant_Garamond({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})

const inter = Jost({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://market-tape.cloudandcapital.com'),
  title: 'Market Tape — Markets & Technology Finance | Cloud & Capital',
  description:
    'Market intelligence for FinOps teams. 48 tracked instruments with an expandable table, equity ETF breadth, a source-linked AI compute deal tracker, and Lumen explaining dated market snapshots, with clear score definitions and questions for a technology cost review.',
  openGraph: {
    title: 'Market Tape — Markets & Technology Finance | Cloud & Capital',
    description: 'Market intelligence for FinOps teams. 48 tracked instruments with an expandable table, equity ETF breadth, a source-linked AI compute deal tracker, and Lumen explaining dated market snapshots, with clear score definitions and questions for a technology cost review.',
    url: 'https://market-tape.cloudandcapital.com',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    description: 'Market intelligence for FinOps teams. 48 tracked instruments with an expandable table, equity ETF breadth, a source-linked AI compute deal tracker, and Lumen explaining dated market snapshots, with clear score definitions and questions for a technology cost review.',
    title: 'Market Tape — Markets & Technology Finance | Cloud & Capital',
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
    <html lang="en" data-color-mode="light" suppressHydrationWarning className={`${playfair.variable} ${inter.variable}`}>
      <head><meta name="theme-color" content="#F5EEE9" /><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head>
      <body className="min-h-screen bg-cream text-charcoal antialiased">
        <SiteNav />
        <div className="tape-page-content">{children}</div>
      </body>
    </html>
  )
}
