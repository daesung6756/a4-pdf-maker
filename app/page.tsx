'use client'

import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useForm } from 'react-hook-form'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { usePdfControls } from '../components/PdfControlsProvider'
import { t } from '../lib/i18n'
import { useLanguage } from '../components/LanguageProvider'
import PageDialogs from '../components/PageDialogs'
import ScrollProgress from '../components/ScrollProgress'
import MobileScrollHint from '../components/MobileScrollHint'
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
    registerHandlers({ onSave, onReset, onPdfSubmit })
    return () => {
      registerHandlers({ onSave: () => {}, onReset: () => {}, onPdfSubmit: async () => {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSave, onReset, onPdfSubmit])

  // Top progress bar is handled by ScrollProgress component

  // Mobile hint handled by MobileScrollHint component

  return (
    <>
      <PageDialogs lang={lang} saveDialogOpen={saveDialogOpen} setSaveDialogOpen={setSaveDialogOpen} saveDialogMessage={saveDialogMessage} loading={loading} />

      <main className={`bg-gray-50 main`}>
        {/* custom top progress scrollbar for horizontal preview scroll */}
        <div className="main-scroll-progress hidden" aria-hidden="true"><div className="bar" /></div>
        <ScrollProgress pagesHtml={pagesHtml} />
        <MobileScrollHint lang={lang} />
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
