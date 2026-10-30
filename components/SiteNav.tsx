'use client'

import { useState, useEffect, useRef } from 'react'
import ColorModeToggle from './ColorModeToggle'
import Link from 'next/link'

const BASE = 'https://cloudandcapital.com'

export default function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const toolsRef = useRef<HTMLLIElement>(null)
  const mobileToggleRef = useRef<HTMLButtonElement>(null)
  const desktopToolsRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (e.target instanceof Element && e.target.closest('#mobile-navigation')) return
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
    if (mobileOpen) mobileToggleRef.current?.focus()
    else if (toolsOpen) desktopToolsRef.current?.focus()
  }

  const linkCls = 'tape-nav-link no-underline transition-colors duration-150'
  const mobileLinkCls = 'tape-mobile-link block px-7 py-[0.8rem] no-underline transition-colors duration-150'

  const navLinks = [
    { label: 'Services', href: `${BASE}/services` },
    { label: 'About',      href: `${BASE}/#about` },
    { label: 'Guides & writing', href: `${BASE}/insights` },
    { label: 'Contact', href: `${BASE}/#contact` },
  ]

  const toolLinks = [
    { label: 'All free tools', href: `${BASE}/tools` },
    { label: 'AI Cost Lens', href: 'https://lens.cloudandcapital.com' },
    { label: 'Software Renewal Tracker', href: `${BASE}/tools/software-renewal-tracker` },
    { label: 'Market Tape',       href: 'https://market-tape.cloudandcapital.com' },
    { label: 'Signal Audit',      href: `${BASE}/signal-audit` },
    { label: 'Cloud Cost Guard', href: 'https://guard.cloudandcapital.com' },
  ]

  return (
    <>
      <a href="#tape-main" className="tape-skip-link">Skip to content</a>
      <nav
        aria-label="Primary navigation"
        onKeyDown={event => { if (event.key === 'Escape') closeMobile() }}
        className="tape-nav fixed top-0 left-0 right-0 z-50 flex items-center border-b border-black/[0.07]"
        style={{ background: 'var(--theme-panel, rgba(245,238,233,0.96))', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
      >
        <div className="tape-nav-inner">

          {/* Logo */}
          <div className="tape-nav-brand"><a href={BASE} className="tape-wordmark">
            Cloud &amp; Capital
          </a><Link href="/" className="tape-nav-title">Market Tape</Link></div>

          {/* Desktop links */}
          <ul className="tape-desktop-nav items-center gap-6 list-none m-0 p-0">
            {navLinks.map(l => (
              <li key={l.label}><a href={l.href} className={linkCls}>{l.label}</a></li>
            ))}

            {/* Tools dropdown */}
            <li ref={toolsRef} className="relative">
              <button
                ref={desktopToolsRef}
                type="button"
                aria-expanded={toolsOpen}
                aria-controls="desktop-tools-menu"
                onClick={(e) => { e.stopPropagation(); setToolsOpen(o => !o) }}
                className="tape-nav-link bg-transparent border-none cursor-pointer flex items-center gap-1 transition-colors duration-150"
                style={{ lineHeight: '1', verticalAlign: 'baseline' }}
              >
                Tools
                <span className={`text-sm inline-block transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {toolsOpen && (
                <ul
                  id="desktop-tools-menu"
                  className="absolute top-[calc(100%+0.85rem)] right-0 list-none m-0 p-[0.4rem_0] min-w-[172px] z-10"
                  style={{ background: 'var(--theme-bg, #f5eee9)', border: '1px solid var(--theme-line, rgba(0,0,0,0.08))', boxShadow: '0 8px 28px rgba(0,0,0,0.08)' }}
                >
                  {toolLinks.map(l => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="tape-nav-link block px-5 py-3 no-underline whitespace-nowrap transition-colors duration-150"
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

          <ColorModeToggle />
          {/* Hamburger */}
          <button
            ref={mobileToggleRef}
            type="button"
            className="tape-menu-toggle flex-col justify-center gap-[5px] bg-transparent border-none cursor-pointer p-[6px_4px]"
            onClick={() => setMobileOpen(o => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {[0,1,2].map(i => (
              <span key={i} className="block w-[22px] h-[1.5px] rounded-sm" style={{ background: 'var(--tape-menu-ink, #000)' }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      {mobileOpen && (
        <div
          id="mobile-navigation"
          onKeyDown={event => { if (event.key === 'Escape') closeMobile() }}
          className="fixed left-0 right-0 z-40 overflow-y-auto"
          style={{ top: 'var(--tape-nav-height)', background: 'var(--theme-deep, #191714)', borderTop: '1px solid var(--theme-line, rgba(255,255,255,0.06))', boxShadow: '0 12px 32px rgba(0,0,0,0.2)', maxHeight: 'calc(100vh - var(--tape-nav-height))' }}
        >
          <ul className="list-none m-0 p-[0.75rem_0_1.25rem]">
            {navLinks.map(l => (
              <li key={l.label}><a href={l.href} onClick={closeMobile} className={mobileLinkCls}>{l.label}</a></li>
            ))}
            <li>
              <button
                type="button"
                aria-expanded={toolsOpen}
                aria-controls="mobile-tools-menu"
                onClick={event => { event.stopPropagation(); setToolsOpen(o => !o) }}
                className="tape-mobile-link block w-full text-left px-7 py-[0.8rem] bg-transparent border-none cursor-pointer transition-colors duration-150"
              >
                Tools {toolsOpen ? '▴' : '▾'}
              </button>
              {toolsOpen && (
                <ul id="mobile-tools-menu" className="list-none m-0 p-[0.25rem_0]" style={{ background: 'var(--theme-deep, #191714)' }}>
                  {toolLinks.map(l => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        onClick={closeMobile}
                        className="tape-mobile-link block pl-[2.75rem] pr-7 py-3 no-underline transition-colors duration-150"
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
