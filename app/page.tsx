'use client'

import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useForm } from 'react-hook-form'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { usePdfControls } from '../components/PdfControlsProvider'
import { t } from '../lib/i18n'
import { useLanguage } from '../components/LanguageProvider'
import { FormData } from '../types/form'
import { Dialog } from '../components/ui/Dialog'

// Load Form as a client-only component to avoid server-side evaluation of DOM APIs
const Form = dynamic(() => import('../components/Form'), { ssr: false })


export default function Page() {
  const form = useForm<FormData>({ defaultValues: { content: '' } })
  const { handleSubmit, reset, setValue } = form
  const templateRef = useRef<HTMLDivElement | null>(null)
  const [editorContent, setEditorContent] = useState<string>('')
  const [preview, setPreview] = useState<string>('')
  const [pages, setPages] = useState<number>(1)
  const [pagesHtml, setPagesHtml] = useState<string[]>([])
  const [mounted, setMounted] = useState<boolean>(false)
  const [currentLine, setCurrentLine] = useState<string>('')
  const [loading, setLoading] = useState<string | null>(null)
  const { lang } = useLanguage()
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveDialogMessage, setSaveDialogMessage] = useState<string | null>(null)
  

  useEffect(() => {
    setMounted(true)
  }, [])
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))


  // register header control handlers so top-level Header buttons can trigger page actions
  try {
    // usePdfControls must be called in component body — move below
  } catch {}

  useEffect(() => {
    if (!mounted) return
    try {
      const saved = localStorage.getItem('pdfForm')
      if (saved) {
        const data = JSON.parse(saved) as FormData
        setEditorContent(data.content)
        setPreview(data.content)
        setValue('content', data.content)
      }
    } catch {}
  }, [mounted, setValue])

  const onSave = React.useCallback(async () => {
    setLoading('saving')
    try {
      const toSave = { content: editorContent }
      localStorage.setItem('pdfForm', JSON.stringify(toSave))
      await wait(850)
      try {
        setSaveDialogMessage(t(lang, 'save_success'));
        setSaveDialogOpen(true)
      } catch {}
    } catch (e) {
      try {
        setSaveDialogMessage(t(lang, 'save_failed'));
        setSaveDialogOpen(true)
      } catch {}
    } finally {
      setLoading(null)
    }
  }, [editorContent])

  const onReset = React.useCallback(async () => {
    setLoading('resetting')
    try {
      try { localStorage.setItem('pdfForm:resetAt', String(Date.now())) } catch (e) { /* ignore */ }
      try { localStorage.removeItem('pdfForm') } catch (e) { /* ignore */ }
      if (typeof reset === 'function') reset({ content: '' })
      try { setEditorContent('') } catch (e) { /* ignore */ }
      try { setPreview('') } catch (e) { /* ignore */ }
      await wait(700)
    } catch (err) {
      console.error('Error in onReset:', err)
  try { alert(t(lang, 'reset_error') + (err instanceof Error ? err.message : String(err))) } catch {}
      throw err
    } finally {
      setLoading(null)
    }
  }, [reset])

  // listen for global reset events in case provider invoked dispatch fallback
  useEffect(() => {
    const handler = () => {
      onReset()
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pdf:reset', handler as EventListener)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pdf:reset', handler as EventListener)
      }
    }
  }, [onReset])

  

  

  const onPdfSubmit = React.useCallback(async (data: FormData) => {
    const el = templateRef.current
    if (!el) return
    el.classList.add('pdf-preview')
    // Ensure editor styles are default (no multi-column layout)
    const editors = el.querySelectorAll('.ql-editor')
    editors.forEach(editor => {
      ;(editor as HTMLElement).style.columnCount = ''
      ;(editor as HTMLElement).style.columnGap = ''
      ;(editor as HTMLElement).style.columnFill = ''
    })
    // Temporarily remove preview highlights so they don't get rendered into the PDF
    let removedHighlights: HTMLElement[] = []
    try {
      removedHighlights = Array.from(el.querySelectorAll('.preview-highlight')) as HTMLElement[]
      removedHighlights.forEach(h => h.classList.remove('preview-highlight'))
      const canvas = await html2canvas(el, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const imgProps = pdf.getImageProperties(imgData)
      const imgWidth = pageWidth - margin * 2
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width
      const maxHeight = pageHeight - margin * 2
      const finalHeight = Math.min(imgHeight, maxHeight)
      const finalWidth = (imgProps.width * finalHeight) / imgProps.height
      pdf.addImage(imgData, 'PNG', margin, margin, finalWidth, finalHeight)
      pdf.save('document.pdf')
    } finally {
      // restore preview state
      el.classList.remove('pdf-preview')
      // restore any removed highlights
      try {
        removedHighlights.forEach(h => h.classList.add('preview-highlight'))
      } catch (e) { /* ignore */ }
      // Remove columns
      editors.forEach(editor => {
        (editor as HTMLElement).style.columnCount = ''
        ;(editor as HTMLElement).style.columnGap = ''
        ;(editor as HTMLElement).style.columnFill = ''
      })
    }
  }, [])

  // Register handlers with provider (after functions are declared)
  const { registerHandlers } = usePdfControls()
  useEffect(() => {
    // register handlers with provider
    registerHandlers({ onSave, onReset, onPdfSubmit })
    return () => {
      // reset to noops when unmounting
      registerHandlers({ onSave: () => {}, onReset: () => {}, onPdfSubmit: async () => {} })
      // cleanup done
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSave, onReset, onPdfSubmit])

  // Custom top progress bar for horizontal scrolling of the preview area
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
    // initial
    update()

    return () => {
      try { pf.removeEventListener('scroll', update as EventListener) } catch (e) {}
      try { window.removeEventListener('resize', update) } catch (e) {}
    }
  }, [pagesHtml])

  // Mobile-only: when .editor-toggle is clicked and editor becomes hidden (collapsed),
  // show a centered hint that prompts the user to scroll right. It will blink 3 times
  // at ~1s intervals then auto-remove. Mobile threshold: <=768px.
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
      // avoid showing on non-mobile
      if (!mobileMatch()) return
      // remove existing hint/timers if any
      clearTimers()
      removeHint()

    const el = document.createElement('div')
      el.id = 'scroll-hint'
      el.className = 'scroll-hint'
      el.setAttribute('aria-hidden', 'true')
    el.innerHTML = `<span class="scroll-hint-emoji">👉</span><span class="scroll-hint-text">${t(lang, 'scroll_hint_text')}</span>`
      document.body.appendChild(el)

      // flash sequence: visible for ~2000ms then hidden briefly (blink) before next show
      let i = 0
      const doFlash = () => {
        if (!el.parentNode) return
        // show
        el.classList.add('hint-visible')
        // keep visible for ~2000ms
        timers.push(window.setTimeout(() => {
          // hide briefly to create a blink effect
          el.classList.remove('hint-visible')
          i += 1
          if (i >= count) {
            // final cleanup after short delay
            timers.push(window.setTimeout(() => {
              removeHint()
            }, 300))
            return
          }
          // short hidden gap (~300ms) before next show
          timers.push(window.setTimeout(() => {
            doFlash()
          }, 300))
        }, 2000))
      }

      // small delay before starting to allow UI state to settle
      timers.push(window.setTimeout(() => doFlash(), 80))
    }

    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as Element | null
      if (!target) return
      const toggle = target.closest && (target as Element).closest('.editor-toggle')
      if (!toggle) return
      // only run on mobile
      if (!mobileMatch()) return
      // check after a short delay to allow the layout class toggle animation to apply
      timers.push(window.setTimeout(() => {
        const layout = document.querySelector('.layout-full')
        const collapsed = layout ? layout.classList.contains('collapsed') : false
        if (collapsed) {
          showHint(1)
        } else {
          // if the toggle made the editor visible again, stop any active hint sequences
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
  }, [])

  return (
    <>
      {/* Save confirmation dialog (replaces alert) */}
      <Dialog open={saveDialogOpen} onOpenChange={(v) => setSaveDialogOpen(v)} title={t(lang, 'save')}>
        <p className='text-sm text-gray-700'>{saveDialogMessage}</p>
        <div className='mt-4 flex justify-end'>
          <button className='inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white' onClick={() => setSaveDialogOpen(false)}>{t(lang, 'confirm')}</button>
        </div>
      </Dialog>
      {/* loading overlay shown when saving or resetting to simulate real network/processing */}
      {loading && (
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="loading-card">
            <div className="loading-spinner" aria-hidden="true" />
            <div>
              <div className="loading-text">{loading === 'saving' ? t(lang, 'saving_in_progress') : t(lang, 'resetting_in_progress')}</div>
              <span className="loading-sub">{t(lang, 'loading_wait')}</span>
            </div>
          </div>
        </div>
      )}

      <main className={`bg-gray-50 main`}>
        {/* custom top progress scrollbar for horizontal preview scroll */}
        <div className="main-scroll-progress hidden" aria-hidden="true"><div className="bar" /></div>
        <div>
          <Form
            form={form}
            editorContent={editorContent}
            setEditorContent={setEditorContent}
            preview={preview}
            setPreview={setPreview}
            pages={pages}
            setPages={setPages}
            pagesHtml={pagesHtml}
            setPagesHtml={setPagesHtml}
            templateRef={templateRef}
            onSave={onSave}
            onReset={onReset}
            onPdfSubmit={onPdfSubmit}
            currentLine={currentLine}
            setCurrentLine={setCurrentLine}
          />
        </div>
      </main>
      
    </>
  )
}
