"use client"

import React, { useEffect } from 'react'
import { t } from '../lib/i18n'

type Props = { lang: string }

export default function MobileScrollHint({ lang }: Props) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const mobileMatch = () => window.matchMedia('(max-width: 768px)').matches

    let timers: number[] = []

    const clearTimers = () => {
      timers.forEach(t => clearTimeout(t))
      timers = []
    }

    const removeHint = () => {
      const existing = document.getElementById('scroll-hint')
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing)
    }

    const showHint = (count = 3) => {
      if (!mobileMatch()) return
      clearTimers()
      removeHint()

      const el = document.createElement('div')
      el.id = 'scroll-hint'
      el.className = 'scroll-hint'
      el.setAttribute('aria-hidden', 'true')
      el.innerHTML = `<span class="scroll-hint-emoji">👉</span><span class="scroll-hint-text">${t(lang, 'scroll_hint_text')}</span>`
      document.body.appendChild(el)

      let i = 0
      const doFlash = () => {
        if (!el.parentNode) return
        el.classList.add('hint-visible')
        timers.push(window.setTimeout(() => {
          el.classList.remove('hint-visible')
          i += 1
          if (i >= count) {
            timers.push(window.setTimeout(() => {
              removeHint()
            }, 300))
            return
          }
          timers.push(window.setTimeout(() => {
            doFlash()
          }, 300))
        }, 2000))
      }

      timers.push(window.setTimeout(() => doFlash(), 80))
    }

    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as Element | null
      if (!target) return
      const toggle = target.closest && (target as Element).closest('.editor-toggle')
      if (!toggle) return
      if (!mobileMatch()) return
      timers.push(window.setTimeout(() => {
        const layout = document.querySelector('.layout-full')
        const collapsed = layout ? layout.classList.contains('collapsed') : false
        if (collapsed) {
          showHint(1)
        } else {
          clearTimers()
          removeHint()
        }
      }, 120))
    }

    document.addEventListener('click', onDocClick)

    return () => {
      document.removeEventListener('click', onDocClick)
      clearTimers()
      removeHint()
    }
  }, [lang])

  return null
}
