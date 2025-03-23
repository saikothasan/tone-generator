import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"
import Script from "next/script"

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
  verification: {
    google: "YOUR_GOOGLE_SITE_VERIFICATION_ID", // Replace with your actual verification ID
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" // Replace G-XXXXXXXXXX with your actual Google Analytics ID
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX'); // Replace G-XXXXXXXXXX with your actual Google Analytics ID
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

