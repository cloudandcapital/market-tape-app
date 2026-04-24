import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#f5eee9',
        'cream-dark': '#EBE3DB',
        sage: '#6B8E7F',
        'sage-dark': '#4A6B5F',
        'sage-light': '#8BA898',
        charcoal: '#000000',
        gold: '#D4AF37',
        gain: '#6B8E7F',
        loss: '#C0443A',
        'loss-light': '#E8A09A',
        ink: '#191714',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
