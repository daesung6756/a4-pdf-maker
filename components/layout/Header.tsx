'use client'

import React from 'react'
import Button from '../../components/ui/Button'
import { usePdfControls } from '../PdfControlsProvider'
import { Dialog } from '../../components/ui/Dialog'
import { useState } from 'react'

export default function Header() {
  const { handlers } = usePdfControls()
  const [confirmOpen, setConfirmOpen] = useState(false)

  // PDF 다운로드 still submits the main form (Form component owns the form)
  // 임시 저장 / 초기화 call the registered handlers from the current page
  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">A4 PDF 생성기</h1>
        <div className='flex items-center gap-2'>
          <Button type='submit' form='main-form'>PDF 다운로드</Button>
          <Button type='button' onClick={() => handlers.onSave()}>임시 저장</Button>
          <Button type='button' variant='danger' onClick={() => setConfirmOpen(true)}>초기화</Button>
        </div>
      </header>

      <Dialog
        open={confirmOpen}
        onOpenChange={(v) => setConfirmOpen(v)}
        title={'모든 내용을 초기화하시겠습니까?'}
        description={'초기화하면 로컬에 저장된 임시 데이터가 삭제됩니다. 계속하시겠습니까?'}
      >
        <div className='space-y-4'>
          <div className='flex justify-end gap-2'>
            <Button type='button' variant='ghost' onClick={() => setConfirmOpen(false)}>취소</Button>

            <Button type='button' variant='danger' onClick={() => {
              // close via state so our Dialog's effect will run and unlock body scroll
              setConfirmOpen(false)
              try {
                handlers.onReset()
              } catch (err) {
                console.error('Error during onReset:', err)
                try { alert('초기화 중 오류가 발생했습니다: ' + (err instanceof Error ? err.message : String(err))) } catch {}
              }
              // done
            }}>초기화</Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
