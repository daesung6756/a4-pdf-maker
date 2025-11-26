"use client"

import React, { useEffect } from 'react'

type Props = { pagesHtml: string[] }

export default function ScrollProgress({ pagesHtml }: Props) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    const pf = document.querySelector('.preview-full') as HTMLElement | null
    const container = document.querySelector('.main-scroll-progress') as HTMLElement | null
    const bar = container?.querySelector('.bar') as HTMLElement | null
    if (!pf || !container || !bar) return

    const update = () => {
      const max = pf.scrollWidth - pf.clientWidth
      if (!max || max <= 2) {
        container.classList.add('hidden')
        bar.style.width = '0%'
        return
      }
      container.classList.remove('hidden')
      const ratio = pf.scrollLeft / max
      bar.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`
    }

    pf.addEventListener('scroll', update, { passive: true } as any)
    window.addEventListener('resize', update)
    update()

    return () => {
      try { pf.removeEventListener('scroll', update as EventListener) } catch (e) {}
      try { window.removeEventListener('resize', update) } catch (e) {}
    }
  }, [pagesHtml])

  return null
}
