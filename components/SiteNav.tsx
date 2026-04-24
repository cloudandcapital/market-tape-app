'use client'

import { useState, useEffect, useRef } from 'react'

const BASE = 'https://cloudandcapital.com'

export default function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const toolsRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  function closeMobile() {
    setMobileOpen(false)
    setToolsOpen(false)
  }

  const linkCls = 'font-mono text-[0.57rem] tracking-[0.12em] uppercase text-black/50 hover:text-black no-underline transition-colors duration-150'
  const mobileLinkCls = 'block px-7 py-[0.8rem] font-mono text-[0.68rem] tracking-[0.16em] uppercase text-white/60 hover:text-white no-underline transition-colors duration-150'

  const navLinks = [
    { label: 'Discipline', href: `${BASE}/#discipline` },
    { label: 'Work',       href: `${BASE}/#work` },
    { label: 'About',      href: `${BASE}/#about` },
    { label: 'Community',  href: `${BASE}/#community` },
    { label: 'Writing',    href: `${BASE}/#writing` },
  ]

  const toolLinks = [
    { label: 'Market Tape',    href: 'https://market-tape.cloudandcapital.com' },
    { label: 'Signal Audit',   href: `${BASE}/signal-audit` },
    { label: 'Interactive Lab', href: `${BASE}/interactive-lab` },
  ]

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center border-b border-black/[0.07]"
        style={{ background: 'rgba(245,238,233,0.96)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 w-full flex items-center justify-between">

          {/* Logo */}
          <a href={BASE} className="font-serif text-[0.88rem] font-medium tracking-[0.14em] uppercase text-black no-underline leading-none">
            Cloud &amp; Capital
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
            {navLinks.map(l => (
              <li key={l.label}><a href={l.href} className={linkCls}>{l.label}</a></li>
            ))}

            {/* Tools dropdown */}
            <li ref={toolsRef} className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setToolsOpen(o => !o) }}
                className="font-mono text-[0.57rem] tracking-[0.12em] uppercase text-black/50 hover:text-black bg-transparent border-none cursor-pointer p-0 flex items-center gap-1 transition-colors duration-150"
              >
                Tools
                <span className={`text-[0.44rem] inline-block transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {toolsOpen && (
                <ul
                  className="absolute top-[calc(100%+0.85rem)] right-0 list-none m-0 p-[0.4rem_0] min-w-[172px] z-10"
                  style={{ background: '#faf7f2', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 28px rgba(0,0,0,0.08)' }}
                >
                  {toolLinks.map(l => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="block px-5 py-[0.55rem] font-mono text-[0.57rem] tracking-[0.12em] uppercase text-black/50 hover:text-black no-underline whitespace-nowrap transition-colors duration-150"
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(107,142,127,0.07)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        style={{ background: 'transparent' }}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col justify-center gap-[5px] bg-transparent border-none cursor-pointer p-[6px_4px]"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {[0,1,2].map(i => (
              <span key={i} className="block w-[22px] h-[1.5px] rounded-sm" style={{ background: '#000' }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      {mobileOpen && (
        <div
          className="fixed left-0 right-0 z-40 overflow-y-auto"
          style={{ top: '56px', background: '#191714', borderTop: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 12px 32px rgba(0,0,0,0.35)', maxHeight: 'calc(100vh - 56px)' }}
        >
          <ul className="list-none m-0 p-[0.75rem_0_1.25rem]">
            {navLinks.map(l => (
              <li key={l.label}><a href={l.href} onClick={closeMobile} className={mobileLinkCls}>{l.label}</a></li>
            ))}
            <li>
              <button
                onClick={() => setToolsOpen(o => !o)}
                className="block w-full text-left px-7 py-[0.8rem] font-mono text-[0.68rem] tracking-[0.16em] uppercase text-white/60 hover:text-white bg-transparent border-none cursor-pointer transition-colors duration-150"
              >
                Tools {toolsOpen ? '▴' : '▾'}
              </button>
              {toolsOpen && (
                <ul className="list-none m-0 p-[0.25rem_0]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {toolLinks.map(l => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        onClick={closeMobile}
                        className="block pl-[2.75rem] pr-7 py-[0.6rem] font-mono text-[0.63rem] tracking-[0.14em] uppercase no-underline transition-colors duration-150"
                        style={{ color: 'rgba(244,239,230,0.42)' }}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </div>
      )}
    </>
  )
}
