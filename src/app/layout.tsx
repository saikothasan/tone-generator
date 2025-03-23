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
    images: [
      {
        url: "/song_9271678.png",
        width: 1200,
        height: 630,
        alt: "Professional Tone Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Tone Generator | Audio Frequency Tool",
    description:
      "Generate precise audio tones with adjustable frequency, volume, and waveform. Perfect for musicians, audio engineers, sound therapists, and audiologists.",
    images: ["/song_9271678.png"],
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  verification: {
    google: "1YvWzwVeCxXiSbtPL-G-q3YaxQVQ5_aZYl6y3Ht3yxM", // Replace with your actual verification ID
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/song_9271678.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.svg",
        color: "#ff8729", // Using the orange color from your theme
      },
    ],
  },
  manifest: "/site.webmanifest",
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
          src="https://www.googletagmanager.com/gtag/js?id=G-CKC1M2JP70" // Replace G-XXXXXXXXXX with your actual Google Analytics ID
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-CKC1M2JP70'); // Replace G-XXXXXXXXXX with your actual Google Analytics ID
            `,
          }}
        />

        {/* JSON-LD Structured Data */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Professional Tone Generator",
              description:
                "Generate precise audio tones with adjustable frequency, volume, and waveform. Perfect for musicians, audio engineers, sound therapists, and audiologists.",
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Precise frequency control",
                "Multiple waveform types",
                "Binaural beats",
                "Noise generation",
                "Frequency analysis",
                "Hearing tests",
              ],
              screenshot: "/song_9271678.png",
              softwareVersion: "1.0",
              author: {
                "@type": "Organization",
                name: "Tone Generator Team",
                url: "https://tone-generator.pages.dev",
              },
              potentialAction: {
                "@type": "UseAction",
                target: "https://tone-generator.pages.dev",
              },
            }),
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

