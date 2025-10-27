import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css'

export const metadata: Metadata = {
  title: 'StartupSwipe - Tinder for Startups',
  description: 'AI-powered marketplace connecting investors with innovative startup products',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          {children}
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  )
}
