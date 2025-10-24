<#
Usage:
  .\scripts\add_acceptance.ps1 -Message "새로운 수락 기준 내용"
  .\scripts\add_acceptance.ps1 -Message "내용" -Author "홍길동"

This script appends a timestamped entry to ACCEPTANCE_CRITERIA.md in the repository root.
#>
param(
    [Parameter(Mandatory=$true)][string]$Message,
    [string]$Author = "user"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
$acFile = Join-Path $repoRoot 'ACCEPTANCE_CRITERIA.md'

if (-not (Test-Path $acFile)) {
    Write-Error "ACCEPTANCE_CRITERIA.md not found at $acFile"
    exit 1
}

$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$entryHeader = "### 추가 수락 기준 — $timestamp"
$meta = "- 작성자: $Author\n"

$entry = "$entryHeader`n$meta`n$Message`n`n"

Add-Content -Path $acFile -Value $entry -Encoding UTF8

Write-Host "수락 기준에 항목이 추가되었습니다: $timestamp"
Write-Host "파일: $acFile"

# Show last 15 lines for quick verification
Get-Content $acFile -Tail 15 | ForEach-Object { Write-Host $_ }
