import React from 'react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-sm text-gray-600">요청하신 페이지가 존재하지 않거나 경로가 잘못되었습니다.</p>
      </div>
    </div>
  )
}
