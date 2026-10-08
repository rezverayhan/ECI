import { useEffect, useRef, useState } from 'react'
import { NAV_SECTIONS } from './details-types'
import { cn } from '@/lib/utils'

export function SectionNavigation() {
  const [activeSection, setActiveSection] = useState<string>(
    NAV_SECTIONS[0]?.id ?? 'sec-employee',
  )
  const navRef = useRef<HTMLElement>(null)
  const isClickScrolling = useRef(false)
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (isClickScrolling.current) return
      if (!navRef.current) return

      const navRect = navRef.current.getBoundingClientRect()
      // Cutoff point just beneath the sticky nav bar
      const triggerY = navRect.bottom + 24

      for (let i = NAV_SECTIONS.length - 1; i >= 0; i--) {
        const item = NAV_SECTIONS[i]
        if (!item) continue
        const sectionEl = document.getElementById(item.id)
        if (sectionEl) {
          const rect = sectionEl.getBoundingClientRect()
          if (rect.top <= triggerY) {
            setActiveSection(item.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    }
  }, [])

  function scrollToSection(id: string) {
    const element = document.getElementById(id)
    const navEl = navRef.current
    if (!element) return

    setActiveSection(id)
    isClickScrolling.current = true
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => {
      isClickScrolling.current = false
    }, 800)

    const navHeight = navEl ? navEl.getBoundingClientRect().height : 48
    const elementRect = element.getBoundingClientRect()
    const targetY = window.pageYOffset + elementRect.top - navHeight - 16

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: 'smooth',
    })
  }

  return (
    <nav
      ref={navRef}
      aria-label="User details sections"
      className="sticky top-0 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-9 lg:px-9 py-2.5 bg-canvas/90 backdrop-blur-md border-b border-border/80 transition-all duration-150"
    >
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
        {NAV_SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollToSection(sec.id)}
              className={cn(
                'shrink-0 px-3.5 py-1.5 rounded-md text-xs sm:text-sm transition-all duration-150 outline-none select-none cursor-pointer',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold backdrop-blur-md shadow-[0_1px_2px_rgba(49,94,251,0.06)]'
                  : 'text-text-secondary hover:text-text hover:bg-surface/70 font-medium',
              )}
            >
              {sec.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
