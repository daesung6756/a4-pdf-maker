"use client"

import React from 'react'
import { AVAILABLE_LANGS, t } from '../../lib/i18n'
import { useLanguage } from '../LanguageProvider'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  const current = AVAILABLE_LANGS.find(l => l.code === lang) || AVAILABLE_LANGS[0]

  return (
    <div className="relative inline-block">
      <select
        aria-label={t(lang, 'language_select')}
        value={lang}
        onChange={(e) => setLang(e.target.value as any)}
        className="appearance-none pr-8 pl-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        {AVAILABLE_LANGS.map(l => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>

      {/* custom chevron */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
