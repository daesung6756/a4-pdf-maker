import { useEffect, useState } from 'react'

export default function useQuillSetup() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let mounted = true

    ;(async () => {
      try {
        const quillModule = await import('quill')
        const Quill = (quillModule && (quillModule.default || quillModule)) as any

        const Font = Quill.import && Quill.import('formats/font')
        if (Font) {
          Font.whitelist = ['arial', 'courier', 'georgia', 'lucida', 'tahoma', 'times', 'trebuchet', 'verdana', 'roboto', 'open-sans', 'lato', 'noto-sans-kr']
          Quill.register(Font, true)
        }

        const Size = Quill.import && Quill.import('formats/size')
        if (Size) {
          const base = ['8px','10px','12px','14px','16px','18px','20px','24px','28px','32px','36px']
          Size.whitelist = base
          Quill.register(Size, true)

          const sizeStyleId = 'quill-custom-sizes'
          if (!document.getElementById(sizeStyleId)) {
            const s2 = document.createElement('style')
            s2.id = sizeStyleId
            s2.innerHTML = base.map(sz => {
              const cls = `ql-size-${sz}`
              return `.ql-snow .${cls}, .ql-editor .${cls}, .ql-container .ql-editor .${cls} { font-size: ${sz} !important; }`
            }).join('\n')
            document.head.appendChild(s2)
          }
        }

        const styleId = 'quill-custom-fonts'
        if (!document.getElementById(styleId)) {
          const s = document.createElement('style')
          s.id = styleId
          s.innerHTML = `
            /* Support both editor (ql-snow) and standalone preview (.ql-editor) selectors */
            .ql-snow .ql-font-arial, .ql-editor .ql-font-arial { font-family: Arial, Helvetica, sans-serif; }
            .ql-snow .ql-font-courier, .ql-editor .ql-font-courier { font-family: 'Courier New', Courier, monospace; }
            .ql-snow .ql-font-georgia, .ql-editor .ql-font-georgia { font-family: Georgia, serif; }
            .ql-snow .ql-font-lucida, .ql-editor .ql-font-lucida { font-family: 'Lucida Sans Unicode', 'Lucida Grande', sans-serif; }
            .ql-snow .ql-font-tahoma, .ql-editor .ql-font-tahoma { font-family: Tahoma, Geneva, sans-serif; }
            .ql-snow .ql-font-times, .ql-editor .ql-font-times { font-family: 'Times New Roman', Times, serif; }
            .ql-snow .ql-font-trebuchet, .ql-editor .ql-font-trebuchet { font-family: 'Trebuchet MS', Helvetica, sans-serif; }
            .ql-snow .ql-font-verdana, .ql-editor .ql-font-verdana { font-family: Verdana, Geneva, sans-serif; }
            .ql-snow .ql-font-roboto, .ql-editor .ql-font-roboto { font-family: 'Roboto', sans-serif; }
            .ql-snow .ql-font-open-sans, .ql-editor .ql-font-open-sans { font-family: 'Open Sans', sans-serif; }
            .ql-snow .ql-font-lato, .ql-editor .ql-font-lato { font-family: 'Lato', sans-serif; }
            .ql-snow .ql-font-noto-sans-kr, .ql-editor .ql-font-noto-sans-kr { font-family: 'Noto Sans KR', sans-serif; }
        `
          document.head.appendChild(s)
        }
      } catch (e) {
        // registration is optional — swallow errors
      } finally {
        if (mounted) setReady(true)
      }
    })()

    return () => { mounted = false }
  }, [])

  return ready
}
