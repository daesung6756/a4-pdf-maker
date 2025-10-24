import ko from '../locales/ko/common.json'
import en from '../locales/en/common.json'
import ja from '../locales/ja/common.json'
import zh from '../locales/zh/common.json'

type Resources = Record<string, Record<string, string>>

const resources: Resources = {
  ko,
  en,
  ja,
  zh
}

export function t(lang: string | undefined, key: string) {
  const l = (lang || 'ko') as keyof typeof resources
  const res = resources[l] || resources['en']
  return res[key] || resources['en'][key] || key
}

export const AVAILABLE_LANGS = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' }
]
