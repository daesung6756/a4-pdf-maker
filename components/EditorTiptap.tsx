"use client"

import React, { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Code from '@tiptap/extension-code'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Gapcursor from '@tiptap/extension-gapcursor'
import TextAlign from '@tiptap/extension-text-align'

type Props = {
  initialContent?: string
  onChange?: (html: string) => void
}

export default function EditorTiptap({ initialContent = '', onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: true }),
      Underline,
      Highlight,
      Code,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Gapcursor,
      Placeholder.configure({ placeholder: 'Write something...' })
    ],
    content: initialContent || '<p></p>',
    onUpdate: ({ editor }) => {
      try {
        const html = editor.getHTML()
        onChange && onChange(html)
      } catch (e) { /* swallow */ }
    }
  })

  // sync initialContent changes
  // Sync external `initialContent` into the editor only when it actually differs
  // from the editor's current HTML. This avoids resetting the editor (which
  // interrupts IME composition and moves the caret to the end / last cell).
  useEffect(() => {
    if (!editor) return
    try {
      const current = editor.getHTML()
      if (initialContent && initialContent !== current) {
        editor.commands.setContent(initialContent)
      }
    } catch (e) {
      // swallow: defensive for rare cases where getHTML() may throw during init
    }
  }, [initialContent, editor])

  return (
    <div>
      {/* Simple toolbar */}
      <div className='flex gap-2 mb-2 flex-wrap items-center'>
        <button aria-label='굵게' title='굵게' type='button' onClick={() => editor?.chain().focus().toggleBold().run()} className='p-2 rounded hover:bg-gray-100' >
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 4h7a4 4 0 010 8H6z M6 12h8a4 4 0 010 8H6z' />
          </svg>
        </button>

        <button aria-label='기울임' title='기울임' type='button' onClick={() => editor?.chain().focus().toggleItalic().run()} className='p-2 rounded hover:bg-gray-100'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 4v3m0 0v3m0 0v6m0 0v3' transform='rotate(20 10 10)' />
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 4l-8 16' />
          </svg>
        </button>

        <button aria-label='밑줄' title='밑줄' type='button' onClick={() => editor?.chain().focus().toggleUnderline().run()} className='p-2 rounded hover:bg-gray-100'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <path strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' d='M6 2v6a6 6 0 0012 0V2' />
            <path strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' d='M4 20h16' />
          </svg>
        </button>

        <button aria-label='하이라이트' title='하이라이트' type='button' onClick={() => editor?.chain().focus().toggleHighlight().run()} className='p-2 rounded hover:bg-gray-100'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <path strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' d='M3 12l2 2 4-4 6 6 6-6' />
          </svg>
        </button>

        <button aria-label='링크' title='링크' type='button' onClick={() => { const url = window.prompt('URL'); if (url) editor?.chain().focus().setLink({ href: url }).run() }} className='p-2 rounded hover:bg-gray-100'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 14a5 5 0 007.07 0l1.41-1.41a5 5 0 00-7.07-7.07L10 6.93' />
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 10a5 5 0 00-7.07 0L5.51 11.41a5 5 0 007.07 7.07L14 17.07' />
          </svg>
        </button>

        <button aria-label='코드' title='코드' type='button' onClick={() => editor?.chain().focus().toggleCode().run()} className='p-2 rounded hover:bg-gray-100'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <path strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' d='M16 18l6-6-6-6' />
            <path strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' d='M8 6L2 12l6 6' />
          </svg>
        </button>

        {/* Alignment buttons: left / center / right / justify */}
        <div className='h-6 border-l ml-2 mr-2'></div>
        <button aria-label='왼쪽 정렬' title='왼쪽 정렬' type='button' onClick={() => (editor as any)?.chain().focus().setTextAlign('left').run()} className='p-2 rounded hover:bg-gray-100'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <path d='M3 6h14' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M3 10h10' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M3 14h14' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M3 18h10' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </button>

        <button aria-label='가운데 정렬' title='가운데 정렬' type='button' onClick={() => (editor as any)?.chain().focus().setTextAlign('center').run()} className='p-2 rounded hover:bg-gray-100'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <path d='M5 6h14' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' transform='translate(0,0) scale(0.9)' />
            <path d='M7 10h10' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M5 14h14' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' transform='translate(0,0) scale(0.9)' />
            <path d='M7 18h10' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </button>

        <button aria-label='오른쪽 정렬' title='오른쪽 정렬' type='button' onClick={() => (editor as any)?.chain().focus().setTextAlign('right').run()} className='p-2 rounded hover:bg-gray-100'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <path d='M7 6h14' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M11 10h10' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M7 14h14' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M11 18h10' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </button>

        <button aria-label='양쪽 정렬' title='양쪽 정렬' type='button' onClick={() => (editor as any)?.chain().focus().setTextAlign('justify').run()} className='p-2 rounded hover:bg-gray-100'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <path d='M3 6h18' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M3 10h18' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M3 14h18' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M3 18h18' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </button>

        <button aria-label='이미지 삽입' title='이미지 삽입' type='button' onClick={() => { const src = window.prompt('Image URL'); if (src) editor?.chain().focus().setImage({ src }).run() }} className='p-2 rounded hover:bg-gray-100'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <rect x='3' y='3' width='18' height='18' rx='2' ry='2' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <circle cx='8.5' cy='8.5' r='1.5' strokeWidth='2' />
            <path d='M21 15l-5-5L5 21' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </button>

        <div className='h-6 border-l ml-2 mr-2'></div>

        <button aria-label='표 삽입' title='표 삽입' type='button' onClick={() => { const rowsStr = window.prompt('Rows', '2'); const colsStr = window.prompt('Cols', '2'); const rows = Math.max(1, parseInt(rowsStr || '2', 10) || 2); const cols = Math.max(1, parseInt(colsStr || '2', 10) || 2); editor?.chain().focus().insertTable({ rows, cols }).run() }} className='p-2 rounded hover:bg-gray-100'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <rect x='3' y='4' width='18' height='16' rx='2' ry='2' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M3 10h18' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M10 4v16' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </button>

        <button aria-label='행 추가' title='행 추가' type='button' onClick={() => editor?.chain().focus().addRowAfter().run()} className='p-2 rounded hover:bg-gray-100'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <path d='M12 5v14' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M5 12h14' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </button>

        <button aria-label='열 추가' title='열 추가' type='button' onClick={() => editor?.chain().focus().addColumnAfter().run()} className='p-2 rounded hover:bg-gray-100'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <path d='M5 12h14' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M12 5v14' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </button>

        <button aria-label='표 삭제' title='표 삭제' type='button' onClick={() => editor?.chain().focus().deleteTable().run()} className='p-2 rounded hover:bg-red-50 text-red-600'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <path d='M3 6h18' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M10 11v6' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M14 11v6' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </button>
      </div>

      <div className='border rounded p-2 bg-white'>
        <div>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
