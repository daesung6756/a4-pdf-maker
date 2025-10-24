"use client"
import React from 'react'
import { t } from '../lib/i18n'
import { useLanguage } from '../components/LanguageProvider'

type Props = { error: Error; reset: () => void }

export default function RootError({ error, reset }: Props) {
  const { lang } = useLanguage()

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-2">{t(lang, 'error_occurred')}</h1>
        <p className="text-sm text-gray-600 mb-4">{t(lang, 'error_try_again')}</p>
        <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded mb-4">{String(error?.message)}</pre>
        <div className="flex justify-end">
          <button onClick={() => reset()} className="px-3 py-1 bg-blue-600 text-white rounded">{t(lang, 'retry')}</button>
        </div>
      </div>
    </div>
  )
}
