// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { env } from '@/lib/env'
import { GlobalErrorTracker } from '@/components/GlobalErrorTracker'
import { clsx } from 'clsx'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// Validate env on start
console.log('[ASAS] Booting application in', env.NODE_ENV);

export const metadata: Metadata = {
  title: 'ASAS RE-OS — Le Système d\'Exploitation Immobilier',
  description: 'Un ERP/CRM ultra-performant conçu spécifiquement pour les agences immobilières modernes.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  themeColor: '#0F1113',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={clsx(inter.variable, spaceGrotesk.variable, jetbrainsMono.variable)}>
      <body className="bg-asas-sand dark:bg-[#0B0C0E] text-asas-charcoal dark:text-asas-sand antialiased font-sans flex flex-col min-h-screen selection:bg-asas-gold/30">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <GlobalErrorTracker />
          <Toaster position="top-right" toastOptions={{ className: 'font-sans font-medium text-sm border border-white/10 dark:bg-[#0A1829] dark:text-white', style: { borderRadius: '12px', background: '#0A1829', color: '#fff' } }} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
