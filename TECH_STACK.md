 # 기술 스택

 ## 프레임워크
- Next.js (App Router 사용)
- TypeScript

 ## 스타일링
- Tailwind CSS(권장) 또는 CSS Modules

 ## 폼
- React Hook Form
- Zod(스키마 유효성 검사)

 ## PDF 생성 옵션
- 서버사이드(픽셀 단위 정확한 A4 출력 권장):
  - Puppeteer 또는 Playwright를 사용하여 HTML/CSS를 서버에서 PDF로 렌더링
- 클라이언트사이드(백엔드 불필요):
  - html2canvas + jsPDF 또는 html2pdf.js (간단하지만 인쇄 품질에 제한이 있을 수 있음)

 ## 테스트
- Vitest
- React Testing Library

 ## 린팅 및 포맷터
- ESLint
- Prettier

 ## CI/CD
- GitHub Actions(빌드, 린트, 테스트)

 ## 배포
- Vercel(권장) 또는 Node를 지원하는 호스팅
