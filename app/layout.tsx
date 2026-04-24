import type { Metadata } from 'next'
import { Playfair_Display, Inter, DM_Mono } from 'next/font/google'
import './globals.css'

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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${dmMono.variable}`}>
      <body className="min-h-screen bg-cream text-charcoal antialiased">{children}</body>
    </html>
  )
}
