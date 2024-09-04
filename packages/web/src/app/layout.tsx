import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NTM Connect',
  description: 'Connect to all devices managed by NTM Technologies',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`dark bg-gray-100 dark:bg-neutral-800 ${inter.className}`}>{children}</body>
    </html>
  )
}
