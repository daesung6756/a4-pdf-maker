"use client"

import React, { createContext, useContext, useState } from 'react'
import { FormData } from '../types/form'
import { Handlers, ContextShape } from '../types/pdfControls'

const noopSave = () => {}
const noopReset = () => {}
const noopPdf = async () => {}

const defaultHandlers: Handlers = {
  onSave: noopSave,
  onReset: noopReset,
  onPdfSubmit: noopPdf as (data: FormData) => Promise<void>
}

const Ctx = createContext<ContextShape | null>(null)

export function PdfControlsProvider({ children }: { children: React.ReactNode }) {
  // keep current handler implementations in a ref to avoid triggering re-renders
  const handlersRef = React.useRef<Partial<Handlers>>({})

  const registerHandlers = (h: Partial<Handlers>) => {
    // merge implementations into the ref; keep this silent in production
    handlersRef.current = { ...handlersRef.current, ...(h as Handlers) }
  }

  // expose a stable handlers object that delegates to the ref
  const handlers = React.useMemo<Handlers>(() => ({
    onSave: () => {
      try { return (handlersRef.current.onSave ?? noopSave)() } catch (e) { console.error(e); }
    },
    onReset: () => {
      // if a registered implementation exists, call it
      const impl = handlersRef.current.onReset
      if (impl) {
        try { return impl() } catch (e) { console.error(e); }
      }

      // If no handler is registered (timing or missing registration), dispatch a global event
      // so pages/components that care can listen and reset themselves. This makes the
      // reset action more robust to registration timing issues.
      try {
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          const ev = new CustomEvent('pdf:reset')
          window.dispatchEvent(ev)
        }
      } catch (e) {
        // ignore
      }
      return undefined
    },
    onPdfSubmit: async (data: FormData) => {
      try { return (handlersRef.current.onPdfSubmit ?? noopPdf)(data) } catch (e) { console.error(e); }
    }
  }), [])

  return (
    <Ctx.Provider value={{ handlers, registerHandlers }}>
      {children}
    </Ctx.Provider>
  )
}

export function usePdfControls() {
  const ctx = useContext(Ctx)
  if (!ctx) {
    throw new Error('usePdfControls must be used within PdfControlsProvider')
  }
  return ctx
}

export default PdfControlsProvider
