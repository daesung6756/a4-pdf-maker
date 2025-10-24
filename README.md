 # 마이크로사이트: 폼 → A4 PDF

 이 저장소는 사용자가 입력한 폼 데이터를 A4 크기의 PDF로 변환하여 다운로드하거나 인쇄할 수 있는 마이크로사이트 프로젝트입니다. 사이트는 Next.js 로 제작되었으며 반응형과 접근성(Accessibility)을 고려해 설계되었습니다.

 프로젝트 사양, 기술 스택, 수락 기준, 실행 방법은 다른 문서 파일을 참고하세요.

자동 수락 기준 추가 스크립트:

`scripts/add_acceptance.ps1` 스크립트를 사용하면 새로운 수락 기준을 `ACCEPTANCE_CRITERIA.md`에 타임스탬프와 작성자 메타와 함께 자동으로 추가할 수 있습니다.

예시:

```powershell
Set-Location 'C:\project\pdf'
.\scripts\add_acceptance.ps1 -Message "모바일에서 PDF 미리보기가 보여야 함" -Author "홍길동"
```
