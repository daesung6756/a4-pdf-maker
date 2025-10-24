 # 실행 가이드 (Runbook)

 로컬 개발을 위한 빠른 셋업 및 실행 지침입니다.

사전 요구사항
- Node.js 18+ (LTS 권장)
- npm 또는 pnpm

스캐폴드(권장)
1. `C:\project\pdf`에서 아래 명령을 실행하세요:

```powershell
npx create-next-app@latest . --ts --app --eslint --tailwind
```

2. 권장 패키지 설치:

```powershell
npm install react-hook-form zod @hookform/resolvers
# 서버사이드 PDF를 사용하려면 puppeteer-core 와 적절한 Chromium 바이너리 또는 Playwright 설정이 필요합니다.
```

로컬 실행

```powershell
npm run dev
```

기타 노트
- 서버사이드 PDF 생성을 사용할 경우, 헤드리스 크로미엄을 실행하는 서버리스 함수나 API 라트를 구성해야 합니다. Vercel에서는 Playwright 구성이나 외부 렌더링 서비스를 고려하세요.
