import ToneGenerator from "@/components/tone-generator"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Professional Tone Generator | Audio Frequency Tool",
  description:
    "Generate precise audio tones with adjustable frequency, volume, and waveform. Perfect for musicians, audio engineers, sound therapists, and audiologists.",
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <ToneGenerator />
    </main>
  )
}

