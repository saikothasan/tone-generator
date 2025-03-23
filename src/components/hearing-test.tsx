"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Play, Square, VolumeX, Volume2, Ear } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HearingTestProps {
  audioContext: AudioContext | null
  initAudio: () => void
}

export default function HearingTest({ audioContext, initAudio }: HearingTestProps) {
  const { toast } = useToast()

  const [isRunning, setIsRunning] = useState(false)
  const [currentFrequency, setCurrentFrequency] = useState(0)
  const [volume, setVolume] = useState(50)
  const [testType, setTestType] = useState<"ascending" | "descending" | "random">("ascending")
  const [testResults, setTestResults] = useState<{ frequency: number; heard: boolean }[]>([])
  const [startFreq, setStartFreq] = useState(20)
  const [endFreq, setEndFreq] = useState(20000)
  const [step, setStep] = useState<"octave" | "half-octave" | "third-octave">("octave")

  // Audio nodes
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null)
  const [gainNode, setGainNode] = useState<GainNode | null>(null)

  // Test frequencies based on step size
  const getTestFrequencies = () => {
    const frequencies: number[] = []
    let current = startFreq

    // Calculate multiplier based on step size
    let multiplier = 2.0 // octave
    if (step === "half-octave") multiplier = Math.sqrt(2)
    if (step === "third-octave") multiplier = Math.pow(2, 1 / 3)

    while (current <= endFreq) {
      frequencies.push(Math.round(current * 10) / 10)
      current *= multiplier
    }

    if (testType === "descending") {
      return frequencies.reverse()
    } else if (testType === "random") {
      // Fisher-Yates shuffle
      for (let i = frequencies.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[frequencies[i], frequencies[j]] = [frequencies[j], frequencies[i]]
      }
    }

    return frequencies
  }

  const [testFrequencies, setTestFrequencies] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Start the hearing test
  const startTest = () => {
    initAudio()
    if (!audioContext) return

    const frequencies = getTestFrequencies()
    setTestFrequencies(frequencies)
    setCurrentIndex(0)
    setCurrentFrequency(frequencies[0])
    setTestResults([])
    setIsRunning(true)

    // Create audio nodes
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()

    osc.type = "sine"
    osc.frequency.value = frequencies[0]

    // Start with volume at 0
    gain.gain.value = 0

    // Connect nodes
    osc.connect(gain)
    gain.connect(audioContext.destination)

    // Start oscillator
    osc.start()

    // Store references
    setOscillator(osc)
    setGainNode(gain)

    // Fade in
    if (gain) {
      gain.gain.setValueAtTime(0, audioContext.currentTime)
      gain.gain.linearRampToValueAtTime(volume / 100, audioContext.currentTime + 0.5)
    }

    toast({
      title: "Hearing Test Started",
      description: "Press 'Yes' when you can hear the tone, or 'No' if you can't.",
    })
  }

  // Stop the hearing test
  const stopTest = () => {
    if (oscillator) {
      // Fade out
      if (gainNode && audioContext) {
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5)

        // Stop after fade out
        setTimeout(() => {
          oscillator.stop()
          oscillator.disconnect()
        }, 500)
      } else {
        oscillator.stop()
        oscillator.disconnect()
      }
    }

    setOscillator(null)
    setGainNode(null)
    setIsRunning(false)

    if (testResults.length > 0) {
      // Show results summary
      const lowestHeard = Math.min(...testResults.filter((r) => r.heard).map((r) => r.frequency))
      const highestHeard = Math.max(...testResults.filter((r) => r.heard).map((r) => r.frequency))

      toast({
        title: "Hearing Test Complete",
        description: `Your hearing range: ${lowestHeard.toFixed(0)} Hz to ${highestHeard.toFixed(0)} Hz`,
      })
    }
  }

  // Record response and move to next frequency
  const recordResponse = (heard: boolean) => {
    // Record result
    setTestResults([...testResults, { frequency: currentFrequency, heard }])

    // Move to next frequency
    const nextIndex = currentIndex + 1
    if (nextIndex < testFrequencies.length) {
      setCurrentIndex(nextIndex)
      setCurrentFrequency(testFrequencies[nextIndex])

      // Update oscillator frequency
      if (oscillator && audioContext) {
        // Fade out
        if (gainNode) {
          gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime)
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2)
        }

        // Change frequency after fade out
        setTimeout(() => {
          if (oscillator) {
            oscillator.frequency.value = testFrequencies[nextIndex]

            // Fade back in
            if (gainNode) {
              gainNode.gain.setValueAtTime(0, audioContext.currentTime)
              gainNode.gain.linearRampToValueAtTime(volume / 100, audioContext.currentTime + 0.2)
            }
          }
        }, 200)
      }
    } else {
      // Test complete
      stopTest()
    }
  }

  // Update volume during test
  useEffect(() => {
    if (gainNode && isRunning) {
      gainNode.gain.value = volume / 100
    }
  }, [volume, gainNode, isRunning])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (oscillator) {
        oscillator.stop()
        oscillator.disconnect()
      }
    }
  }, [oscillator])

  // Format frequency for display
  const formatFrequency = (freq: number) => {
    if (freq >= 1000) {
      return `${(freq / 1000).toFixed(1)} kHz`
    }
    return `${freq.toFixed(0)} Hz`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ear className="h-5 w-5" />
          Hearing Range Test
        </CardTitle>
        <CardDescription>Test your hearing range with a series of tones at different frequencies</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isRunning ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test-type">Test Type</Label>
                <Select value={testType} onValueChange={(value) => setTestType(value as any)}>
                  <SelectTrigger id="test-type">
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ascending">Ascending (Low to High)</SelectItem>
                    <SelectItem value="descending">Descending (High to Low)</SelectItem>
                    <SelectItem value="random">Random Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="step-size">Frequency Steps</Label>
                <Select value={step} onValueChange={(value) => setStep(value as any)}>
                  <SelectTrigger id="step-size">
                    <SelectValue placeholder="Select step size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="octave">Octave (×2 frequency)</SelectItem>
                    <SelectItem value="half-octave">Half Octave</SelectItem>
                    <SelectItem value="third-octave">Third Octave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-freq">Start Frequency (Hz)</Label>
                <Input
                  id="start-freq"
                  type="number"
                  min="20"
                  max="20000"
                  value={startFreq}
                  onChange={(e) => setStartFreq(Number.parseInt(e.target.value) || 20)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-freq">End Frequency (Hz)</Label>
                <Input
                  id="end-freq"
                  type="number"
                  min="20"
                  max="20000"
                  value={endFreq}
                  onChange={(e) => setEndFreq(Number.parseInt(e.target.value) || 20000)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="volume-slider">Volume</Label>
                <span className="text-sm">{volume}%</span>
              </div>
              <div className="flex items-center gap-2">
                <VolumeX size={16} className="text-muted-foreground" />
                <Slider
                  id="volume-slider"
                  value={[volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(values) => setVolume(values[0])}
                  className="flex-1"
                />
                <Volume2 size={16} className="text-muted-foreground" />
              </div>
            </div>

            <div className="text-sm text-muted-foreground mt-4">
              <p>
                This test will play a series of tones at different frequencies to help determine your hearing range.
              </p>
              <p className="mt-2">
                Start with a comfortable volume level. For each tone, indicate whether you can hear it or not.
              </p>
              <p className="mt-2">
                The average human hearing range is between 20 Hz and 20,000 Hz, but this varies by age and other
                factors.
              </p>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <div className="text-4xl font-bold text-primary">{formatFrequency(currentFrequency)}</div>
              <div className="text-sm text-muted-foreground">
                Test {currentIndex + 1} of {testFrequencies.length}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="volume-slider-test">Volume</Label>
                <span className="text-sm">{volume}%</span>
              </div>
              <div className="flex items-center gap-2">
                <VolumeX size={16} className="text-muted-foreground" />
                <Slider
                  id="volume-slider-test"
                  value={[volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(values) => setVolume(values[0])}
                  className="flex-1"
                />
                <Volume2 size={16} className="text-muted-foreground" />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" size="lg" onClick={() => recordResponse(false)} className="w-32">
                No, I can't hear it
              </Button>
              <Button size="lg" onClick={() => recordResponse(true)} className="w-32">
                Yes, I can hear it
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Results so far:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Frequency</div>
                  <div className="font-medium">Heard</div>
                  {testResults.map((result, index) => (
                    <React.Fragment key={index}>
                      <div>{formatFrequency(result.frequency)}</div>
                      <div>{result.heard ? "Yes" : "No"}</div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {!isRunning ? (
          <Button onClick={startTest} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Start Hearing Test
          </Button>
        ) : (
          <Button variant="destructive" onClick={stopTest} className="flex items-center gap-2">
            <Square className="h-4 w-4" />
            Stop Test
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

