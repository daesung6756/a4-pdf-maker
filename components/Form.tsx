 'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useLanguage } from './LanguageProvider'
import { t } from '../lib/i18n'
import { UseFormReturn } from 'react-hook-form'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

import { FormData } from '../types/form'

type FormProps = {
  form: UseFormReturn<FormData>
  editorContent: string
  setEditorContent: (value: string) => void
  preview: string
  setPreview: (value: string) => void
  pages: number
  setPages: (value: number) => void
  pagesHtml: string[]
  setPagesHtml: (value: string[]) => void
  templateRef: React.RefObject<HTMLDivElement | null>
  onSave: () => void
  onReset: () => void
  onPdfSubmit: (data: FormData) => Promise<void>
  currentLine: string
  setCurrentLine: (value: string) => void
}

const Form = ({ form, editorContent, setEditorContent, preview, setPreview, pages, setPages, pagesHtml, setPagesHtml, templateRef, onSave, onReset, onPdfSubmit, currentLine, setCurrentLine }: FormProps) => {
  const { handleSubmit, setValue } = form

  // option data to keep markup small and maintainable
  const FONT_OPTIONS = [
    { key: '', label: '기본' },
    { key: 'arial', label: 'Arial' },
    { key: 'courier', label: 'Courier' },
    { key: 'georgia', label: 'Georgia' },
    { key: 'lucida', label: 'Lucida' },
    { key: 'tahoma', label: 'Tahoma' },
    { key: 'times', label: 'Times' },
    { key: 'trebuchet', label: 'Trebuchet' },
    { key: 'verdana', label: 'Verdana' },
    { key: 'roboto', label: 'Roboto' },
    { key: 'open-sans', label: 'Open Sans' },
    { key: 'lato', label: 'Lato' },
    { key: 'noto-sans-kr', label: 'Noto Sans KR' }
  ]

  const SIZE_OPTIONS = [
    { key: '', label: '기본' },
    { key: '8px', label: '8px' },
    { key: '10px', label: '10px' },
    { key: '12px', label: '12px' },
    { key: '14px', label: '14px' },
    { key: '16px', label: '16px' },
    { key: '18px', label: '18px' },
    { key: '20px', label: '20px' },
    { key: '24px', label: '24px' },
    { key: '28px', label: '28px' },
    { key: '32px', label: '32px' },
    { key: '36px', label: '36px' }
  ]

  useEffect(() => {
    paginateDom();
  }, [preview]);

  const handleEditorChange = (content: string) => {
    setEditorContent(content)
    setPreview(content)
    setValue('content', content)
    paginateDom()
  }
  // Remove header/font/size from default toolbar — we'll provide custom controls above the editor.
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ]
  }

  // Quill ref + custom control state
  const quillRef = useRef<any>(null)
  const [selectedFont, setSelectedFont] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quillReady, setQuillReady] = useState(false)

  // Client-side registration is handled by a reusable hook
  // dynamic import + CSS injection happen inside useQuillSetup
  // that returns `quillReady` boolean
  // (keeps Form.tsx focused on UI and behavior)
  // lazy-load the hook to avoid server-side require errors
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const useQuillSetup = require('../hooks/useQuillSetup').default as () => boolean
  const quillReadyFromHook = useQuillSetup()
  useEffect(() => { if (quillReadyFromHook) setQuillReady(true) }, [quillReadyFromHook])

  

  const applyFormat = (format: 'font' | 'size' | 'header', value: string) => {
    const q = quillRef.current?.getEditor && quillRef.current.getEditor()
    if (!q) return
    if (format === 'font') {
      // map dropdown value to registered font key
      q.format('font', value || false)
    } else if (format === 'size') {
      if (!value) q.format('size', false)
      else {
        // apply the selected px value directly (no doubling)
        q.format('size', value)
      }
    }
    // refresh content state
    const html = q.root.innerHTML
    setEditorContent(html)
    setPreview(html)
    setValue('content', html)
    paginateDom()
  }

  // handle dropdown change events and keep selected state in sync
  const onFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value
    setSelectedFont(v)
    applyFormat('font', v)
  }

  const onSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value
    setSelectedSize(v)
    applyFormat('size', v)
  }

  const paginateDom = () => {
    if (typeof window === 'undefined') return

    if (!preview) {
      setPages(1)
      setPagesHtml([''])
      return
    }

    const modifiedPreview = preview;

    const off = document.createElement('div')
    off.style.position = 'absolute'
    off.style.left = '-9999px'
    off.style.top = '0'
    off.style.width = getComputedStyle(document.documentElement).getPropertyValue('--a4-width') || '210mm'
    off.innerHTML = `<div class="p-8"><div class="ql-editor">${modifiedPreview}</div></div>`
    // Assign block ids to the off-screen preview so pagesHtml contains data-block-id attributes
    const assignBlockIdsToOff = (rootEl: HTMLElement) => {
      try {
        const editorNode = rootEl.querySelector('.ql-editor') as HTMLElement | null
        if (!editorNode) return
        let idx = 0
        Array.from(editorNode.children).forEach((child) => {
          const tag = (child as HTMLElement).tagName?.toLowerCase()
          if (tag === 'ol' || tag === 'ul') {
            Array.from((child as HTMLElement).children).forEach((li) => {
              (li as HTMLElement).setAttribute('data-block-id', `blk-${idx++}`)
            })
          } else {
            ;(child as HTMLElement).setAttribute('data-block-id', `blk-${idx++}`)
          }
        })
      } catch (e) { /* silent */ }
    }
    assignBlockIdsToOff(off)
    // off-screen preview for pagination
    document.body.appendChild(off)

    const pxPerMm = 96 / 25.4
    const pageHeightPx = Math.round(297 * pxPerMm)
    const pageMarginMm = 10
    const marginPx = pageMarginMm * pxPerMm

    const wrapper = off.firstElementChild as HTMLElement | null
    let paddingTop = 0
    let paddingBottom = 0
    if (wrapper) {
      const cs = getComputedStyle(wrapper)
      paddingTop = parseFloat(cs.paddingTop || '0')
      paddingBottom = parseFloat(cs.paddingBottom || '0')
    }

  const availableHeight = Infinity // 페이지 나누기 제거: 무한 높이로 설정하여 모든 내용을 하나의 페이지에 표시

    const editorNode = off.querySelector('.ql-editor') as HTMLElement | null
    const children = Array.from(editorNode?.childNodes || [])

    const pagesOut: string[] = []

    const createPageWrapper = () => {
      const pageWrap = document.createElement('div')
      pageWrap.className = 'p-8'
      const inner = document.createElement('div')
      inner.className = 'ql-editor'
      pageWrap.appendChild(inner)
      return pageWrap
    }

    let pageWrap = createPageWrapper()
    off.innerHTML = ''
    off.appendChild(pageWrap)

    for (const child of children) {
      const inner = pageWrap.querySelector('.ql-editor') as HTMLElement
      inner.appendChild((child as Node).cloneNode(true))
      const h = pageWrap.scrollHeight
      if (h > availableHeight && inner.childNodes.length > 1) {
        inner.removeChild(inner.lastChild!)
        pagesOut.push((pageWrap.querySelector('.ql-editor') as HTMLElement).innerHTML)
        pageWrap = createPageWrapper()
        off.innerHTML = ''
        off.appendChild(pageWrap)
        ;(pageWrap.querySelector('.ql-editor') as HTMLElement).appendChild((child as Node).cloneNode(true))
      }
    }

  pagesOut.push((pageWrap.querySelector('.ql-editor') as HTMLElement).innerHTML)

  try { document.body.removeChild(off) } catch (e) {}

    setPagesHtml(pagesOut)
    setPages(Math.max(1, pagesOut.length))
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    paginateDom()
    const handler = () => {
      clearTimeout((handler as any)._t)
      ;(handler as any)._t = setTimeout(() => paginateDom(), 150)
    }
    window.addEventListener('resize', handler)

    // subscribe to quill selection change to sync toolbar dropdowns and highlight preview blocks
    const q = quillRef.current?.getEditor && quillRef.current.getEditor()

    const clearPreviewHighlights = () => {
      try {
        document.querySelectorAll('.preview-highlight').forEach(el => el.classList.remove('preview-highlight'))
      } catch (e) { /* silent */ }
    }

    const highlightPreviewBlocks = (ids: string[]) => {
      try {
        clearPreviewHighlights()
        ids.forEach(id => {
          document.querySelectorAll(`[data-block-id="${id}"]`).forEach(el => el.classList.add('preview-highlight'))
        })
      } catch (e) { /* silent */ }
    }

    const onSelectionChange = (range: any) => {
      if (!q) return
      if (!range) {
        // selection lost, reset dropdowns to defaults
        setSelectedFont('')
        setSelectedSize('')
        clearPreviewHighlights()
        return
      }
      const format = q.getFormat(range)
      setSelectedFont(format.font || '')
      if (format.size) setSelectedSize(String(format.size))
      else setSelectedSize('')

      // Map selection to block ids and highlight preview
      try {
        const lines = q.getLines(range.index, range.length)
        const ids: string[] = []
        lines.forEach((ln: any) => {
          const node = ln.domNode || ln
          const el = (node as HTMLElement).closest ? (node as HTMLElement).closest('[data-block-id]') : null
          if (el) {
            const id = el.getAttribute('data-block-id')
            if (id && !ids.includes(id)) ids.push(id)
          }
        })
        if (ids.length > 0) highlightPreviewBlocks(ids)
        else clearPreviewHighlights()
      } catch (e) {
        clearPreviewHighlights()
      }
    }

    if (q && q.on) {
      q.on('selection-change', onSelectionChange)
      // also handle text-change to update when formats applied programmatically and reassign ids
      q.on('text-change', () => {
        const range = q.getSelection()
        onSelectionChange(range)
      })
      // assign block ids initially and on text-change (debounced)
      const assignBlockIdsToEditor = () => {
        try {
          const qRoot = quillRef.current?.getEditor?.().root as HTMLElement | undefined
          if (!qRoot) return
          let idx = 0
          Array.from(qRoot.children).forEach((child) => {
            if ((child as HTMLElement).nodeType === 1) {
              ;(child as HTMLElement).setAttribute('data-block-id', `blk-${idx++}`)
            }
          })
        } catch (e) { /* silent */ }
      }
      assignBlockIdsToEditor()
      let _t: any
      const textChangeHandler = () => {
        clearTimeout(_t)
        _t = setTimeout(() => assignBlockIdsToEditor(), 200)
      }
      q.on('text-change', textChangeHandler)
    }

    return () => {
      window.removeEventListener('resize', handler)
      clearTimeout((handler as any)._t)
      if (q && q.off) {
        q.off('selection-change')
        q.off('text-change')
        q.off('text-change')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview])

  // hydrate from localStorage using reusable hook
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const useHydrate = require('../hooks/useHydrateFromLocalStorage').default as (k: string, onData: (d: any) => void) => void
  useHydrate('pdfForm', (data: FormData) => {
    if (data?.content) {
      setEditorContent(data.content)
      setPreview(data.content)
      setValue('content', data.content)
    }
  })

  const [collapsed, setCollapsed] = useState(false)
  const { lang } = useLanguage()
  // use reusable hook for breakpoint tracking
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const useIsDesktop = require('../hooks/useIsDesktop').default as (bp?: number) => boolean
  const isDesktop = useIsDesktop(1310)

  return (
    <div className={`layout-full ${collapsed ? 'collapsed' : ''}`}>
      <div className='preview-full'>
        <div>
          <h2 className='text-lg font-semibold mb-2'>{t(lang, 'preview')} (A4) - {pages} {t(lang, 'pages')}</h2>
          <div className='space-y-4' ref={templateRef} id='pdf-template'>
            {pagesHtml.length > 0 ? pagesHtml.map((html, index) => (
              <div key={index} className='pdf-preview border' suppressHydrationWarning>
                <div className='p-8'>
                  <div className="ql-container ql-editor" dangerouslySetInnerHTML={{ __html: html || (index === 0 ? t(lang, 'content_placeholder') : '') }} style={{ minHeight: '200px', padding: 0, border: 'none' }} />
                </div>
              </div>
            )) : (
              <div className='pdf-preview border' suppressHydrationWarning>
                <div className='p-8'>
                  <div className="ql-container ql-editor" style={{}}>{t(lang, 'content_placeholder')}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* toggle button: always render across all widths */}
      <button aria-label='Toggle editor' onClick={() => setCollapsed(!collapsed)} className='editor-toggle'>
        {collapsed ? t(lang, 'editor_show') : t(lang, 'editor_hide')}
      </button>

      <div className='form-fixed'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-4'>
            <strong>{t(lang, 'editor_label')}</strong>
            {/* columns selector removed per design decision */}
          </div>
        </div>

        <form id='main-form' onSubmit={handleSubmit(onPdfSubmit)} className='space-y-4'>
          <div className='mb-2 flex items-center gap-3'>
            <label className='text-sm'>{t(lang, 'font_label')}</label>
            <select value={selectedFont} onChange={onFontChange} className='border rounded px-2 py-1 text-sm'>
              {FONT_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.key === '' ? t(lang, 'default_option') : opt.label}</option>
              ))}
            </select>

            <label className='text-sm'>{t(lang, 'size_label')}</label>
            <select value={selectedSize} onChange={onSizeChange} className='border rounded px-2 py-1 text-sm'>
              {SIZE_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.key === '' ? t(lang, 'default_option') : opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            {quillReady ? (
              <ReactQuill
                ref={quillRef}
                value={editorContent}
                onChange={handleEditorChange}
                modules={modules}
                formats={[
                  'font', 'size',
                  'bold','italic','underline','strike',
                  'color','background','list','bullet','align','link','image','clean'
                ]}
              />
            ) : (
              <div className='border p-4 text-sm text-gray-500'>{t(lang, 'editor_initializing')}</div>
            )}
          </div>
        </form>

        {/* 광고 배너 영역: #main-form 바로 아래에 배너 2개(가상의 이미지) 삽입 */}
        <div id='ad-area' className='add-banner-wrap mt-4 space-y-4'>
          <div className='ad-banner w-full bg-gray-100 border border-dashed rounded-lg flex items-center justify-center h-28 text-gray-700'>
            <div className='text-center'>
              <div className='text-lg font-semibold'>728×90</div>
              <div className='text-sm'>{t(lang, 'banner_area')}</div>
            </div>
          </div>

          <div className='ad-banner w-full bg-gray-100 border border-dashed rounded-lg flex items-center justify-center h-28 text-gray-700'>
            <div className='text-center'>
              <div className='text-lg font-semibold'>728×90</div>
              <div className='text-sm'>{t(lang, 'banner_area')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Form
