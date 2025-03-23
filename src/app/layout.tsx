import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Professional Tone Generator | Audio Frequency Tool",
  description:
    "Generate precise audio tones with adjustable frequency, volume, and waveform. Perfect for musicians, audio engineers, sound therapists, and audiologists.",
  keywords:
    "tone generator, audio frequency, sound generator, binaural beats, white noise, pink noise, brown noise, hearing test, frequency analyzer, sound therapy",
  authors: [{ name: "Tone Generator Team" }],
  openGraph: {
    title: "Professional Tone Generator | Audio Frequency Tool",
    description:
      "Generate precise audio tones with adjustable frequency, volume, and waveform. Perfect for musicians, audio engineers, sound therapists, and audiologists.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Tone Generator | Audio Frequency Tool",
    description:
      "Generate precise audio tones with adjustable frequency, volume, and waveform. Perfect for musicians, audio engineers, sound therapists, and audiologists.",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
