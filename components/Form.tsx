 'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useLanguage } from './LanguageProvider'
import { t } from '../lib/i18n'
import { UseFormReturn } from 'react-hook-form'

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
  // Markdown / rich editor removed — use plain textarea instead

  useEffect(() => {
    paginateDom();
  }, [preview]);

  const handleEditorChange = (value: string) => {
    setEditorContent(value)
    setPreview(value)
    setValue('content', value)
    paginateDom()
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
    paginateDom()
    window.addEventListener('resize', handler)

    return () => {
      window.removeEventListener('resize', handler)
      clearTimeout((handler as any)._t)
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
            <div className='mb-2'>
              <label className='text-sm'>{t(lang, 'editor_label')}</label>
            </div>

          <div>
            <textarea
              value={editorContent}
              onChange={(e) => handleEditorChange(e.target.value)}
              className='w-full h-64 border rounded p-3 text-sm'
              aria-label={t(lang, 'editor_label')}
            />
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
