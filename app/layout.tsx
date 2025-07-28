import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '벗킷 - 시니어 모임 서비스',
  description: '함께하는 즐거움, 새로운 만남',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}