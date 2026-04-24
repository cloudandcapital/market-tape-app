'use client'

import { useState, useEffect, useRef } from 'react'

export default function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const toolsRef = useRef<HTMLLIElement>(null)

  // Close desktop Tools dropdown on outside click
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

  const linkCls = 'font-mono text-[0.58rem] tracking-[0.12em] uppercase text-black/50 hover:text-black no-underline transition-colors duration-150'
  const mobileLinkCls = 'block px-7 py-[0.8rem] font-mono text-[0.68rem] tracking-[0.16em] uppercase text-white/60 hover:text-white no-underline transition-colors duration-150'

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center border-b border-black/[0.07]"
        style={{ background: 'rgba(245,238,233,0.96)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 w-full flex items-center justify-between">

          {/* Logo */}
          <a href="https://cloudandcapital.com"
            className="font-serif text-[0.88rem] font-medium tracking-[0.14em] uppercase text-black no-underline leading-none">
            Cloud &amp; Capital
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-7 list-none m-0 p-0">
            <li><a href="https://cloudandcapital.com" className={linkCls}>Home</a></li>
            <li><a href="https://cloudandcapital.com/#work" className={linkCls}>Work</a></li>
            <li><a href="https://cloudandcapital.com/#writing" className={linkCls}>Writing</a></li>

            {/* Tools dropdown */}
            <li ref={toolsRef} className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setToolsOpen(o => !o) }}
                className="font-mono text-[0.58rem] tracking-[0.12em] uppercase text-black/50 hover:text-black bg-transparent border-none cursor-pointer p-0 flex items-center gap-1 transition-colors duration-150"
              >
                Tools
                <span className={`text-[0.45rem] inline-block transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {toolsOpen && (
                <ul className="absolute top-[calc(100%+0.85rem)] right-0 list-none m-0 p-[0.4rem_0] min-w-[168px] z-10"
                  style={{ background: '#faf7f2', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 28px rgba(0,0,0,0.08)' }}>
                  <li><a href="https://market-tape.cloudandcapital.com" className="block px-5 py-[0.55rem] font-mono text-[0.57rem] tracking-[0.12em] uppercase text-black/50 hover:text-black no-underline transition-colors whitespace-nowrap" style={{ background: 'transparent' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(107,142,127,0.07)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>Market Tape</a></li>
                  <li><a href="https://cloudandcapital.com/signal-audit" className="block px-5 py-[0.55rem] font-mono text-[0.57rem] tracking-[0.12em] uppercase text-black/50 hover:text-black no-underline transition-colors whitespace-nowrap" style={{ background: 'transparent' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(107,142,127,0.07)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>Signal Audit</a></li>
                  <li><a href="https://cloudandcapital.com/interactive-lab" className="block px-5 py-[0.55rem] font-mono text-[0.57rem] tracking-[0.12em] uppercase text-black/50 hover:text-black no-underline transition-colors whitespace-nowrap" style={{ background: 'transparent' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(107,142,127,0.07)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>Interactive Lab</a></li>
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
            <span className="block w-[22px] h-[1.5px] rounded-sm transition-all" style={{ background: '#000' }} />
            <span className="block w-[22px] h-[1.5px] rounded-sm transition-all" style={{ background: '#000' }} />
            <span className="block w-[22px] h-[1.5px] rounded-sm transition-all" style={{ background: '#000' }} />
          </button>
        </div>
      </nav>

      {/* Mobile panel — drops below nav bar */}
      {mobileOpen && (
        <div className="fixed left-0 right-0 z-40 overflow-y-auto"
          style={{ top: '56px', background: '#191714', borderTop: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 12px 32px rgba(0,0,0,0.35)', maxHeight: 'calc(100vh - 56px)' }}>
          <ul className="list-none m-0 p-[0.75rem_0_1.25rem]">
            <li><a href="https://cloudandcapital.com" onClick={closeMobile} className={mobileLinkCls}>Home</a></li>
            <li><a href="https://cloudandcapital.com/#work" onClick={closeMobile} className={mobileLinkCls}>Work</a></li>
            <li><a href="https://cloudandcapital.com/#writing" onClick={closeMobile} className={mobileLinkCls}>Writing</a></li>
            <li>
              <button
                onClick={() => setToolsOpen(o => !o)}
                className="block w-full text-left px-7 py-[0.8rem] font-mono text-[0.68rem] tracking-[0.16em] uppercase text-white/60 hover:text-white bg-transparent border-none cursor-pointer transition-colors duration-150"
              >
                Tools {toolsOpen ? '▴' : '▾'}
              </button>
              {toolsOpen && (
                <ul className="list-none m-0 p-[0.25rem_0]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <li><a href="https://market-tape.cloudandcapital.com" onClick={closeMobile} className="block pl-[2.75rem] pr-7 py-[0.6rem] font-mono text-[0.63rem] tracking-[0.14em] uppercase no-underline transition-colors duration-150" style={{ color: 'rgba(244,239,230,0.42)' }}>Market Tape</a></li>
                  <li><a href="https://cloudandcapital.com/signal-audit" onClick={closeMobile} className="block pl-[2.75rem] pr-7 py-[0.6rem] font-mono text-[0.63rem] tracking-[0.14em] uppercase no-underline transition-colors duration-150" style={{ color: 'rgba(244,239,230,0.42)' }}>Signal Audit</a></li>
                  <li><a href="https://cloudandcapital.com/interactive-lab" onClick={closeMobile} className="block pl-[2.75rem] pr-7 py-[0.6rem] font-mono text-[0.63rem] tracking-[0.14em] uppercase no-underline transition-colors duration-150" style={{ color: 'rgba(244,239,230,0.42)' }}>Interactive Lab</a></li>
                </ul>
              )}
            </li>
          </ul>
        </div>
      )}
    </>
  )
}
