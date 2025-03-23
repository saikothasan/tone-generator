"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Copy, BarChart2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import FrequencyVisualizer from "./frequency-visualizer"
import AudioMeter from "./audio-meter"

interface ToneAnalyzerProps {
  audioContext: AudioContext | null
  initAudio: () => void
  onFrequencyDetected: (frequency: number) => void
}

export default function ToneAnalyzer({ audioContext, initAudio, onFrequencyDetected }: ToneAnalyzerProps) {
  const { toast } = useToast()

  const [isActive, setIsActive] = useState(false)
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>(null)
  const [detectedNote, setDetectedNote] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(0)

  const microphoneStreamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Start microphone analysis
  const startAnalysis = async () => {
    try {
      initAudio()
      if (!audioContext) return

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      microphoneStreamRef.current = stream

      const micSource = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8

      micSource.connect(analyser)
      analyserRef.current = analyser

      setIsActive(true)
      detectPitch()

      toast({
        title: "Microphone Active",
        description: "Listening for tones...",
      })
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  // Stop microphone analysis
  const stopAnalysis = () => {
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach((track) => track.stop())
      microphoneStreamRef.current = null
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    setIsActive(false)
    setDetectedFrequency(null)
    setDetectedNote(null)
    setConfidence(0)
  }

  // Detect pitch using autocorrelation
  const detectPitch = () => {
    if (!analyserRef.current || !isActive || !audioContext) return

    const analyser = analyserRef.current
    const bufferLength = analyser.fftSize
    const dataArray = new Float32Array(bufferLength)

    analyser.getFloatTimeDomainData(dataArray)

    // Calculate RMS to determine if there's enough signal
    let rms = 0
    for (let i = 0; i < bufferLength; i++) {
      rms += dataArray[i] * dataArray[i]
    }
    rms = Math.sqrt(rms / bufferLength)

    // Only process if signal is strong enough
    if (rms > 0.01) {
      // Use autocorrelation to find the fundamental frequency
      const sampleRate = audioContext.sampleRate
      let bestCorrelation = 0
      let bestFreq = 0

      // Calculate autocorrelation
      for (let lag = 10; lag < bufferLength / 2; lag++) {
        let correlation = 0

        for (let i = 0; i < bufferLength / 2; i++) {
          correlation += dataArray[i] * dataArray[i + lag]
        }

        // Normalize
        correlation = correlation / (bufferLength / 2)

        if (correlation > bestCorrelation) {
          bestCorrelation = correlation
          bestFreq = sampleRate / lag
        }
      }

      // Only update if we have a strong enough correlation and frequency is in audible range
      if (bestCorrelation > 0.01 && bestFreq > 20 && bestFreq < 20000) {
        setDetectedFrequency(Math.round(bestFreq * 10) / 10)
        setConfidence(Math.min(bestCorrelation * 100, 100))

        // Calculate musical note
        const note = findClosestNote(bestFreq)
        setDetectedNote(note)
      }
    } else {
      // Signal too weak
      setConfidence(0)
    }

    animationFrameRef.current = requestAnimationFrame(detectPitch)
  }

  // Find closest musical note
  const findClosestNote = (freq: number) => {
    const a4 = 440
    const noteNames = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"]

    // Calculate how many half steps away from A4
    const halfStepsFromA4 = Math.round(12 * Math.log2(freq / a4))

    // Calculate octave and note index
    const octave = 4 + Math.floor((halfStepsFromA4 + 9) / 12)
    let noteIndex = (halfStepsFromA4 + 9) % 12
    if (noteIndex < 0) {
      noteIndex += 12
    }

    return `${noteNames[noteIndex]}${octave}`
  }

  // Format frequency for display
  const formatFrequency = (freq: number) => {
    if (freq >= 1000) {
      return `${(freq / 1000).toFixed(2)} kHz`
    }
    return `${freq.toFixed(freq < 10 ? 2 : freq < 100 ? 1 : 0)} Hz`
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAnalysis()
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Tone Analyzer
        </CardTitle>
        <CardDescription>Analyze audio input from your microphone to detect frequencies</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Button
            onClick={isActive ? stopAnalysis : startAnalysis}
            variant={isActive ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            <Mic className="h-4 w-4" />
            {isActive ? "Stop Microphone" : "Start Microphone"}
          </Button>
        </div>

        {isActive && (
          <>
            <div className="flex items-center gap-4">
              <AudioMeter analyser={analyserRef.current} isActive={isActive} />

              <div className="flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className="text-4xl font-bold text-primary">
                    {detectedFrequency ? formatFrequency(detectedFrequency) : "Listening..."}
                  </div>
                  {detectedNote && <div className="text-xl font-medium">Note: {detectedNote}</div>}
                  <div className="text-sm text-muted-foreground">Confidence: {confidence.toFixed(0)}%</div>
                </div>
              </div>
            </div>

            <div className="h-40 border rounded-md p-2">
              <FrequencyVisualizer analyser={analyserRef.current} isPlaying={isActive} />
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  if (detectedFrequency) {
                    onFrequencyDetected(detectedFrequency)
                    toast({
                      title: "Frequency Copied",
                      description: `${detectedFrequency} Hz has been set as the generator frequency.`,
                    })
                  }
                }}
                disabled={!detectedFrequency || confidence < 50}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Use This Frequency
              </Button>
            </div>
          </>
        )}

        {!isActive && (
          <div className="text-center p-8 text-muted-foreground">
            <BarChart2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Click "Start Microphone" to begin frequency analysis</p>
            <p className="text-sm mt-2">You'll need to grant microphone permission</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

