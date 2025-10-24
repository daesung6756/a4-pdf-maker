"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

type LangContext = {
  lang: Lang
  setLang: (l: Lang) => void
}

const defaultVal: LangContext = {
  lang: 'ko',
  setLang: () => {}
}

const LanguageContext = createContext<LangContext>(defaultVal)

export function useLanguage() {
  return useContext(LanguageContext)
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('ko')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('app:lang')
      if (stored && ['ko', 'en', 'ja', 'zh'].includes(stored)) {
        setLang(stored as Lang)
        return
      }
      const nav = (navigator.language || 'ko').slice(0, 2)
      if (['ko', 'en', 'ja', 'zh'].includes(nav)) setLang(nav as Lang)
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try { localStorage.setItem('app:lang', lang) } catch (e) { }
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}
