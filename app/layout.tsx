import './globals.css'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import PdfControlsProvider from '../components/PdfControlsProvider'

export const metadata = {
  title: 'PDF Microsite',
  description: '폼을 A4 PDF로 변환하는 샘플 앱',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet" />
      </head>
    <body>
      <PdfControlsProvider>
        <Header />
        {children}
        <Footer />
      </PdfControlsProvider>
    </body>
    </html>
  )
}
