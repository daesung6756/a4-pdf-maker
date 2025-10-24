import { useEffect } from 'react'

export default function useHydrateFromLocalStorage(key: string, onData: (data: any) => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const resetAt = localStorage.getItem('pdfForm:resetAt')
      if (resetAt) {
        const ts = Number(resetAt)
        if (!Number.isNaN(ts) && Date.now() - ts < 1000) {
          // recent reset — ignore hydration to avoid race that repopulates immediately
          return
        }
      }
      const saved = localStorage.getItem(key)
      if (saved) {
        const data = JSON.parse(saved)
        onData(data)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
