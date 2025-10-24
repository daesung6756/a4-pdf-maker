"use client"
import React from 'react'

type Props = { error: Error; reset: () => void }

export default function RootError({ error, reset }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-2">문제가 발생했습니다</h1>
        <p className="text-sm text-gray-600 mb-4">앱을 다시 시도해 주세요. 오류가 계속되면 개발 콘솔을 확인하세요.</p>
        <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded mb-4">{String(error?.message)}</pre>
        <div className="flex justify-end">
          <button onClick={() => reset()} className="px-3 py-1 bg-blue-600 text-white rounded">다시 시도</button>
        </div>
      </div>
    </div>
  )
}
