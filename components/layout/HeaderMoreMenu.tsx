"use client"

import React, { useEffect, useRef, useState } from 'react'
import { t } from '../../lib/i18n'

type Props = {
  handlers: any
  onResetRequested: () => void
  lang: string
}

export default function HeaderMoreMenu({ handlers, onResetRequested, lang }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // Close menu when screen becomes wide (>=829px) so the MORE button is hidden
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 829px)')
    const handler = (ev: MediaQueryListEvent | MediaQueryList) => {
      if (mq.matches) setOpen(false)
    }
    // initial
    if (mq.matches) setOpen(false)
    // listen
    if (mq.addEventListener) mq.addEventListener('change', handler as any)
    else mq.addListener(handler as any)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler as any)
      else mq.removeListener(handler as any)
    }
  }, [])

  return (
    <div className='header-actions-more relative' ref={ref}>
      <button aria-haspopup='menu' aria-expanded={open} aria-label='More' className='px-2 py-1 rounded-md' onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <circle cx="5" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="19" cy="12" r="2" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div role='menu' className='more-menu origin-top-right absolute right-0 mt-2 w-44 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-[120]'>
          <div className='py-1'>
            <button type='submit' form='main-form' role='menuitem' className='w-full text-left px-3 py-2 text-sm hover:bg-gray-50' onClick={() => setOpen(false)}>{t(lang, 'pdf_download')}</button>
            <button type='button' role='menuitem' className='w-full text-left px-3 py-2 text-sm hover:bg-gray-50' onClick={() => { try { handlers.onSave() } finally { setOpen(false) } }}>{t(lang, 'save')}</button>
            <button type='button' role='menuitem' className='w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50' onClick={() => { setOpen(false); onResetRequested() }}>{t(lang, 'reset')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
