import React from 'react'
import { headers } from 'next/headers'
import { t } from '../lib/i18n'

export default function NotFound() {
  // server-side language detection from Accept-Language header as a best-effort fallback
  const accept = headers().get('accept-language') || 'ko'
  const nav = accept.slice(0, 2)
  const lang = ['ko', 'en', 'ja', 'zh'].includes(nav) ? (nav as 'ko'|'en'|'ja'|'zh') : 'ko'

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">{t(lang, 'not_found_title')}</h1>
        <p className="text-sm text-gray-600">{t(lang, 'not_found_description')}</p>
      </div>
    </div>
  )
}
