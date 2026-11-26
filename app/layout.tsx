import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

const urlSitio = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'https://v0-upteams.vercel.app'

const tituloSitio = 'Upteam · Programa de embajadores'
const descripcionSitio =
  'Gestiona embajadores, puntos, niveles y premios de tu comunidad en un solo lugar, con cada movimiento registrado en Stellar.'

export const metadata: Metadata = {
  metadataBase: new URL(urlSitio),
  title: tituloSitio,
  description: descripcionSitio,
  applicationName: 'Upteam',
  generator: 'v0.app',
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: 'Upteam',
    title: tituloSitio,
    description: descripcionSitio,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: tituloSitio,
    description: descripcionSitio,
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eceef8' },
    { media: '(prefers-color-scheme: dark)', color: '#12132a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
