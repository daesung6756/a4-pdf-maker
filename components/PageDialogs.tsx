"use client"

import React from 'react'
import { Dialog } from './ui/Dialog'

type Props = {
  lang: string
  saveDialogOpen: boolean
  setSaveDialogOpen: (v: boolean) => void
  saveDialogMessage: string | null
  loading: string | null
}

export default function PageDialogs({ lang, saveDialogOpen, setSaveDialogOpen, saveDialogMessage, loading }: Props) {
  return (
    <>
      <Dialog open={saveDialogOpen} onOpenChange={(v) => setSaveDialogOpen(v)} title={lang ? '저장' : 'Save'}>
        <p className='text-sm text-gray-700'>{saveDialogMessage}</p>
        <div className='mt-4 flex justify-end'>
          <button className='inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white' onClick={() => setSaveDialogOpen(false)}>확인</button>
        </div>
      </Dialog>

      {loading && (
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="loading-card">
            <div className="loading-spinner" aria-hidden="true" />
            <div>
              <div className="loading-text">{loading === 'saving' ? '저장중...' : '초기화 중...'}</div>
              <span className="loading-sub">잠시만 기다려주세요…</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
