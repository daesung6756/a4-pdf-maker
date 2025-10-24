 'use client'

import React from 'react'
import Button from '../../components/ui/Button'
import { usePdfControls } from '../PdfControlsProvider'
import { Dialog } from '../../components/ui/Dialog'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'
import HeaderMoreMenu from './HeaderMoreMenu'
import { t } from '../../lib/i18n'
import { useLanguage } from '../../components/LanguageProvider'

export default function Header() {
  const { handlers } = usePdfControls()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const { lang } = useLanguage()

  // PDF 다운로드 still submits the main form (Form component owns the form)
  // 임시 저장 / 초기화 call the registered handlers from the current page
  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">{t(lang, 'app_title')}</h1>
        <div className='flex items-center gap-2'>
          <LanguageSwitcher />

          {/* Inline actions shown on wide screens (>=830px) */}
          <div className='header-actions-inline flex items-center gap-2'>
            <Button type='submit' form='main-form'>{t(lang, 'pdf_download')}</Button>
            <Button type='button' onClick={() => handlers.onSave()}>{t(lang, 'save')}</Button>
            <Button type='button' variant='danger' onClick={() => setConfirmOpen(true)}>{t(lang, 'reset')}</Button>
          </div>

          {/* Compact "More" menu for small screens (<=829px) */}
          <HeaderMoreMenu handlers={handlers} onResetRequested={() => setConfirmOpen(true)} lang={lang} />
        </div>
      </header>
      <Dialog
        open={confirmOpen}
        onOpenChange={(v) => setConfirmOpen(v)}
        title={t(lang, 'confirm_reset_title')}
        description={t(lang, 'confirm_reset_description')}
      >
        <div className='space-y-4'>
          <div className='flex justify-end gap-2'>
            <Button type='button' variant='ghost' onClick={() => setConfirmOpen(false)}>{t(lang, 'cancel')}</Button>

            <Button type='button' variant='danger' onClick={() => {
              // close via state so our Dialog's effect will run and unlock body scroll
              setConfirmOpen(false)
              try {
                handlers.onReset()
              } catch (err) {
                console.error('Error during onReset:', err)
                try { alert(t(lang, 'reset_error') + (err instanceof Error ? err.message : String(err))) } catch {}
              }
              // done
            }}>{t(lang, 'reset_confirm')}</Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
