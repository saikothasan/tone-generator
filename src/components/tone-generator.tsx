"use client"

import { useState, useRef, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Play,
  Square,
  Volume2,
  AlertTriangle,
  Clock,
  Sliders,
  Music,
  Bookmark,
  Info,
  Moon,
  Sun,
  AudioWaveformIcon as Waveform,
  Mic,
  RotateCcw,
  Headphones,
  HelpCircle,
  Settings,
  Brain,
  Heart,
  Zap,
  PanelLeft,
  PanelRight,
  Globe,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import FrequencyVisualizer from "./frequency-visualizer"
import WaveformVisualizer from "./waveform-visualizer"
import { useTheme } from "next-themes"
import KeyboardShortcuts from "./keyboard-shortcuts"
import ShareLink from "./share-link"
import AudioExport from "./audio-export"
import PresetManager from "./preset-manager"
import ToneAnalyzer from "./tone-analyzer"
import HearingTest from "./hearing-test"
import FrequencyInfo from "./frequency-info"
import { useMobile } from "@/hooks/use-mobile"
import { Drawer, DrawerContent } from "@/components/ui/drawer"

// Types
type WaveType = OscillatorType | "noise-white" | "noise-pink" | "noise-brown" | "binaural"
type Preset = {
  name: string
  frequency: number
  waveType: WaveType
  description?: string
  category: string
  harmonics?: { [key: number]: number }
  binauralBeat?: number
  pan?: number
}

// Musical note frequencies (A4 = 440Hz)
const NOTES = {
  C: 261.63,
  "C#/Db": 277.18,
  D: 293.66,
  "D#/Eb": 311.13,
  E: 329.63,
  F: 349.23,
  "F#/Gb": 369.99,
  G: 392.0,
  "G#/Ab": 415.3,
  A: 440.0,
  "A#/Bb": 466.16,
  B: 493.88,
}

// Presets
const PRESETS: Preset[] = [
  // Musical notes
  { name: "A4 (Concert Pitch)", frequency: 440, waveType: "sine", category: "music" },
  { name: "Middle C (C4)", frequency: 261.63, waveType: "sine", category: "music" },
  { name: "E Guitar (E2)", frequency: 82.41, waveType: "sine", category: "music" },
  { name: "Bass Guitar (E1)", frequency: 41.2, waveType: "sine", category: "music" },

  // Test tones
  { name: "1kHz Test Tone", frequency: 1000, waveType: "sine", category: "test" },
  { name: "10kHz High Frequency", frequency: 10000, waveType: "sine", category: "test" },
  { name: "50Hz Low Frequency", frequency: 50, waveType: "sine", category: "test" },
  { name: "White Noise", frequency: 0, waveType: "noise-white", category: "test" },

  // Therapeutic
  { name: "Alpha Waves (10Hz)", frequency: 10, waveType: "sine", category: "therapy" },
  { name: "Theta Waves (6Hz)", frequency: 6, waveType: "sine", category: "therapy" },
  { name: "Delta Waves (2Hz)", frequency: 2, waveType: "sine", category: "therapy" },
  {
    name: "Binaural Beat (10Hz)",
    frequency: 200,
    waveType: "binaural",
    description: "Carrier: 200Hz, Beat: 10Hz",
    category: "therapy",
    binauralBeat: 10,
  },
  {
    name: "Meditation Tone",
    frequency: 432,
    waveType: "sine",
    description: "Alternative tuning frequency",
    category: "therapy",
  },
  {
    name: "Healing Frequency",
    frequency: 528,
    waveType: "sine",
    description: "Solfeggio frequency",
    category: "therapy",
  },

  // Special
  { name: "Subwoofer Test (30Hz)", frequency: 30, waveType: "sine", category: "special" },
  { name: "Dog Whistle (20kHz)", frequency: 20000, waveType: "sine", category: "special" },
  {
    name: "Rich Harmonic Tone",
    frequency: 220,
    waveType: "sine",
    category: "special",
    harmonics: { 2: 50, 3: 30, 4: 20, 5: 10 },
  },
  {
    name: "Stereo Pan Test",
    frequency: 500,
    waveType: "sine",
    category: "special",
    pan: 0.5,
  },
]

export default function ToneGenerator() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const isMobile = useMobile()

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false)
  const [frequency, setFrequency] = useState(440)
  const [volume, setVolume] = useState(50)
  const [waveType, setWaveType] = useState<WaveType>("sine")
  const [pan, setPan] = useState(0)
  const [binauralBeat, setBinauralBeat] = useState(10)
  const [harmonics, setHarmonics] = useState<{ [key: number]: number }>({
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  })

  // UI state
  const [activeTab, setActiveTab] = useState("generator")
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [favorites, setFavorites] = useState<
    {
      frequency: number
      waveType: WaveType
      name?: string
      harmonics?: { [key: number]: number }
      binauralBeat?: number
      pan?: number
    }[]
  >([])
  const [history, setHistory] = useState<{ frequency: number; waveType: WaveType; timestamp: number }[]>([])
  const [timerActive, setTimerActive] = useState(false)
  const [timerDuration, setTimerDuration] = useState(300) // 5 minutes in seconds
  const [timerRemaining, setTimerRemaining] = useState(300)
  const [isSweeping, setIsSweeping] = useState(false)
  const [sweepStart, setSweepStart] = useState(100)
  const [sweepEnd, setSweepEnd] = useState(1000)
  const [sweepDuration, setSweepDuration] = useState(5)
  const [sweepType, setSweepType] = useState<"linear" | "logarithmic">("logarithmic")
  const [microphoneActive, setMicrophoneActive] = useState(false)
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>(null)
  const [showAnalyzer, setShowAnalyzer] = useState(true)
  const [showWaveform, setShowWaveform] = useState(true)
  const [showSidePanel, setShowSidePanel] = useState(!isMobile)
  const [sidePanelContent, setSidePanelContent] = useState<"info" | "analyzer" | "presets">("info")
  const [showDrawer, setShowDrawer] = useState(false)
  const [drawerContent, setDrawerContent] = useState<"info" | "analyzer" | "presets">("info")

  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const oscillatorRightRef = useRef<OscillatorNode | null>(null) // For binaural beats
  const gainNodeRef = useRef<GainNode | null>(null)
  const pannerNodeRef = useRef<StereoPannerNode | null>(null)
  const analyserNodeRef = useRef<AnalyserNode | null>(null)
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const harmonicOscillatorsRef = useRef<{ [key: number]: { osc: OscillatorNode; gain: GainNode } }>({})
  const sweepStartTimeRef = useRef<number>(0)
  const sweepIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const microphoneStreamRef = useRef<MediaStream | null>(null)
  const microphoneAnalyserRef = useRef<AnalyserNode | null>(null)

  // Initialize audio context on first user interaction
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Create analyzer for visualizations
      const analyser = audioContextRef.current.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      analyserNodeRef.current = analyser
    }
  }

  // Generate noise buffer
  const createNoiseBuffer = (type: "white" | "pink" | "brown") => {
    if (!audioContextRef.current) return null

    const bufferSize = audioContextRef.current.sampleRate * 2 // 2 seconds of noise
    const buffer = audioContextRef.current.createBuffer(2, bufferSize, audioContextRef.current.sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      // Different noise colors have different spectral characteristics
      if (type === "white") {
        // White noise - equal energy per frequency
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1
        }
      } else if (type === "pink") {
        // Pink noise - equal energy per octave
        let b0 = 0,
          b1 = 0,
          b2 = 0,
          b3 = 0,
          b4 = 0,
          b5 = 0,
          b6 = 0

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1

          // Pink noise filter
          b0 = 0.99886 * b0 + white * 0.0555179
          b1 = 0.99332 * b1 + white * 0.0750759
          b2 = 0.969 * b2 + white * 0.153852
          b3 = 0.8665 * b3 + white * 0.3104856
          b4 = 0.55 * b4 + white * 0.5329522
          b5 = -0.7616 * b5 - white * 0.016898

          data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
          data[i] *= 0.11 // Scale to make -1..1

          b6 = white * 0.115926
        }
      } else if (type === "brown") {
        // Brown noise - power decreases 6dB per octave
        let lastOut = 0

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1

          // Simple low-pass filter
          data[i] = (lastOut + 0.02 * white) / 1.02
          lastOut = data[i]
          data[i] *= 3.5 // Scale to make -1..1
        }
      }
    }

    return buffer
  }

  // Start playing the tone
  const startTone = () => {
    initAudio()
    if (!audioContextRef.current) return

    // Stop any existing audio
    stopTone()

    // Create nodes
    const ctx = audioContextRef.current
    const gainNode = ctx.createGain()
    const panner = ctx.createStereoPanner()

    // Configure gain (volume)
    gainNode.gain.value = volume / 100

    // Configure panning
    panner.pan.value = pan

    // Connect analyzer
    panner.connect(analyserNodeRef.current!)
    analyserNodeRef.current!.connect(ctx.destination)

    // Connect main audio path
    gainNode.connect(panner)

    // Store references
    gainNodeRef.current = gainNode
    pannerNodeRef.current = panner

    // Handle different sound types
    if (waveType === "noise-white" || waveType === "noise-pink" || waveType === "noise-brown") {
      // Create and play noise
      const noiseType = waveType.split("-")[1] as "white" | "pink" | "brown"
      const noiseBuffer = createNoiseBuffer(noiseType)

      if (noiseBuffer) {
        const noiseSource = ctx.createBufferSource()
        noiseSource.buffer = noiseBuffer
        noiseSource.loop = true

        noiseSource.connect(gainNode)
        noiseSource.start()

        noiseSourceRef.current = noiseSource
      }
    } else if (waveType === "binaural") {
      // Create binaural beat (two oscillators with slightly different frequencies)
      const oscillatorLeft = ctx.createOscillator()
      const oscillatorRight = ctx.createOscillator()

      // Split the stereo channels
      const merger = ctx.createChannelMerger(2)
      const splitter = ctx.createChannelSplitter(2)

      // Configure oscillators
      oscillatorLeft.type = "sine"
      oscillatorRight.type = "sine"

      // Set frequencies for binaural beat
      oscillatorLeft.frequency.value = frequency
      oscillatorRight.frequency.value = frequency + binauralBeat

      // Connect left oscillator to left channel only
      const gainLeft = ctx.createGain()
      oscillatorLeft.connect(gainLeft)
      gainLeft.connect(merger, 0, 0)

      // Connect right oscillator to right channel only
      const gainRight = ctx.createGain()
      oscillatorRight.connect(gainRight)
      gainRight.connect(merger, 0, 1)

      // Connect merged output to main gain
      merger.connect(gainNode)

      // Start oscillators
      oscillatorLeft.start()
      oscillatorRight.start()

      // Store references
      oscillatorRef.current = oscillatorLeft
      oscillatorRightRef.current = oscillatorRight
    } else {
      // Standard oscillator
      const oscillator = ctx.createOscillator()

      // Configure oscillator
      oscillator.type = waveType as OscillatorType
      oscillator.frequency.value = frequency

      // Add harmonics if any are active
      Object.entries(harmonics).forEach(([harmonic, level]) => {
        const harmonicNum = Number.parseInt(harmonic)
        if (level > 0) {
          const harmonicOsc = ctx.createOscillator()
          const harmonicGain = ctx.createGain()

          harmonicOsc.type = waveType as OscillatorType
          harmonicOsc.frequency.value = frequency * harmonicNum

          harmonicGain.gain.value = level / 100

          harmonicOsc.connect(harmonicGain)
          harmonicGain.connect(gainNode)

          harmonicOsc.start()

          harmonicOscillatorsRef.current[harmonicNum] = {
            osc: harmonicOsc,
            gain: harmonicGain,
          }
        }
      })

      // Connect and start oscillator
      oscillator.connect(gainNode)
      oscillator.start()

      // Store reference
      oscillatorRef.current = oscillator
    }

    setIsPlaying(true)

    // Add to history
    addToHistory()

    // Start sweep if enabled
    if (isSweeping) {
      startFrequencySweep()
    }

    // Start timer if active
    if (timerActive) {
      startTimer()
    }
  }

  // Stop playing the tone
  const stopTone = () => {
    // Stop main oscillator
    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
      oscillatorRef.current.disconnect()
      oscillatorRef.current = null
    }

    // Stop binaural oscillator
    if (oscillatorRightRef.current) {
      oscillatorRightRef.current.stop()
      oscillatorRightRef.current.disconnect()
      oscillatorRightRef.current = null
    }

    // Stop noise source
    if (noiseSourceRef.current) {
      noiseSourceRef.current.stop()
      noiseSourceRef.current.disconnect()
      noiseSourceRef.current = null
    }

    // Stop harmonic oscillators
    Object.values(harmonicOscillatorsRef.current).forEach(({ osc }) => {
      osc.stop()
      osc.disconnect()
    })
    harmonicOscillatorsRef.current = {}

    // Stop sweep
    if (sweepIntervalRef.current) {
      clearInterval(sweepIntervalRef.current)
      sweepIntervalRef.current = null
    }

    // Stop timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    setIsPlaying(false)
  }

  // Toggle play/stop
  const togglePlay = () => {
    if (isPlaying) {
      stopTone()
    } else {
      startTone()
    }
  }

  // Start frequency sweep
  const startFrequencySweep = () => {
    if (!audioContextRef.current || !oscillatorRef.current) return

    const startTime = audioContextRef.current.currentTime
    sweepStartTimeRef.current = startTime

    // Update frequency based on sweep progress
    const updateSweepFrequency = () => {
      if (!audioContextRef.current || !oscillatorRef.current) return

      const currentTime = audioContextRef.current.currentTime
      const elapsedTime = currentTime - sweepStartTimeRef.current
      const progress = Math.min(elapsedTime / sweepDuration, 1)

      let currentFreq
      if (sweepType === "linear") {
        currentFreq = sweepStart + (sweepEnd - sweepStart) * progress
      } else {
        // Logarithmic sweep
        currentFreq = sweepStart * Math.pow(sweepEnd / sweepStart, progress)
      }

      // Update UI frequency
      setFrequency(Math.round(currentFreq * 100) / 100)

      // If sweep is complete, restart or stop
      if (progress >= 1) {
        // Reset sweep
        sweepStartTimeRef.current = currentTime
      }
    }

    // Update frequency 30 times per second
    sweepIntervalRef.current = setInterval(updateSweepFrequency, 33)
  }

  // Start timer
  const startTimer = () => {
    setTimerRemaining(timerDuration)

    timerIntervalRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          // Timer complete
          stopTone()
          clearInterval(timerIntervalRef.current!)
          setTimerActive(false)
          toast({
            title: "Timer Complete",
            description: "The tone generator has stopped as scheduled.",
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Add current settings to history
  const addToHistory = () => {
    setHistory((prev) => {
      const newHistory = [{ frequency, waveType, timestamp: Date.now() }, ...prev].slice(0, 20) // Keep only last 20 items
      return newHistory
    })
  }

  // Add to favorites
  const addToFavorites = (name?: string) => {
    const newFavorite = {
      frequency,
      waveType,
      name: name || `${frequency} Hz ${waveType}`,
      harmonics: { ...harmonics },
      binauralBeat: waveType === "binaural" ? binauralBeat : undefined,
      pan,
    }

    setFavorites((prev) => [...prev, newFavorite])

    toast({
      title: "Added to Favorites",
      description: `${frequency} Hz ${waveType} has been saved.`,
    })
  }

  // Save preset with all current settings
  const savePreset = (preset: {
    name: string
    frequency: number
    waveType: WaveType
    harmonics: { [key: number]: number }
    binauralBeat?: number
    pan: number
    category: string
  }) => {
    setFavorites((prev) => [...prev, preset])

    toast({
      title: "Preset Saved",
      description: `"${preset.name}" has been added to your presets.`,
    })
  }

  // Load a preset or favorite
  const loadSettings = (
    freq: number,
    wave: WaveType,
    options?: { harmonics?: { [key: number]: number }; binauralBeat?: number; pan?: number },
  ) => {
    setFrequency(freq)
    setWaveType(wave)

    // Load additional settings if provided
    if (options) {
      if (options.harmonics) {
        setHarmonics(options.harmonics)
      }

      if (options.binauralBeat && wave === "binaural") {
        setBinauralBeat(options.binauralBeat)
      }

      if (typeof options.pan === "number") {
        setPan(options.pan)
      }
    }

    if (isPlaying) {
      stopTone()
      setTimeout(() => startTone(), 10)
    }
  }

  // Start microphone analysis
  const startMicrophoneAnalysis = async () => {
    try {
      initAudio()
      if (!audioContextRef.current) return

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      microphoneStreamRef.current = stream

      const micSource = audioContextRef.current.createMediaStreamSource(stream)
      const analyser = audioContextRef.current.createAnalyser()
      analyser.fftSize = 2048

      micSource.connect(analyser)
      microphoneAnalyserRef.current = analyser

      setMicrophoneActive(true)

      // Start frequency detection
      detectFrequency()
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
  const stopMicrophoneAnalysis = () => {
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach((track) => track.stop())
      microphoneStreamRef.current = null
    }

    setMicrophoneActive(false)
    setDetectedFrequency(null)
  }

  // Detect fundamental frequency from microphone input
  const detectFrequency = () => {
    if (!microphoneAnalyserRef.current || !microphoneActive) return

    const analyser = microphoneAnalyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Float32Array(bufferLength)

    analyser.getFloatTimeDomainData(dataArray)

    // Use autocorrelation to find the fundamental frequency
    const sampleRate = audioContextRef.current!.sampleRate
    let bestCorrelation = 0
    let bestFreq = 0

    // Calculate autocorrelation
    for (let lag = 10; lag < bufferLength / 2; lag++) {
      let correlation = 0

      for (let i = 0; i < bufferLength / 2; i++) {
        correlation += dataArray[i] * dataArray[i + lag]
      }

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation
        bestFreq = sampleRate / lag
      }
    }

    // Only update if we have a strong enough correlation
    if (bestCorrelation > 0.01) {
      setDetectedFrequency(Math.round(bestFreq * 10) / 10)
    }

    // Continue detection if microphone is still active
    if (microphoneActive) {
      requestAnimationFrame(detectFrequency)
    }
  }

  // Copy current settings to clipboard
  const copyFrequencyLink = () => {
    const url = `${window.location.origin}?freq=${frequency}&wave=${waveType}`
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast({
          title: "Link Copied",
          description: "Settings link copied to clipboard.",
        })
      })
      .catch((err) => console.error("Failed to copy link", err))
  }

  // Export current tone as WAV file
  const exportTone = async () => {
    if (!audioContextRef.current) {
      initAudio()
      if (!audioContextRef.current) return
    }

    const ctx = audioContextRef.current
    const duration = 5 // 5 seconds
    const sampleRate = ctx.sampleRate
    const numSamples = duration * sampleRate

    // Create offline context for rendering
    const offlineCtx = new OfflineAudioContext(2, numSamples, sampleRate)

    // Create nodes
    const oscillator = offlineCtx.createOscillator()
    const gainNode = offlineCtx.createGain()

    // Configure oscillator
    if (
      waveType !== "noise-white" &&
      waveType !== "noise-pink" &&
      waveType !== "noise-brown" &&
      waveType !== "binaural"
    ) {
      oscillator.type = waveType as OscillatorType
      oscillator.frequency.value = frequency
    }

    // Configure gain
    gainNode.gain.value = volume / 100

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(offlineCtx.destination)

    // Add harmonics if any are active
    if (
      waveType !== "noise-white" &&
      waveType !== "noise-pink" &&
      waveType !== "noise-brown" &&
      waveType !== "binaural"
    ) {
      Object.entries(harmonics).forEach(([harmonic, level]) => {
        const harmonicNum = Number.parseInt(harmonic)
        if (level > 0) {
          const harmonicOsc = offlineCtx.createOscillator()
          const harmonicGain = offlineCtx.createGain()

          harmonicOsc.type = waveType as OscillatorType
          harmonicOsc.frequency.value = frequency * harmonicNum

          harmonicGain.gain.value = level / 100

          harmonicOsc.connect(harmonicGain)
          harmonicGain.connect(offlineCtx.destination)

          harmonicOsc.start()
          harmonicOsc.stop(duration)
        }
      })
    }

    // Start rendering
    oscillator.start()
    oscillator.stop(duration)

    try {
      // Render audio
      const renderedBuffer = await offlineCtx.startRendering()

      // Convert to WAV
      const wavBlob = bufferToWav(renderedBuffer)

      // Create download link
      const url = URL.createObjectURL(wavBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `tone_${frequency}Hz_${waveType}.wav`
      a.click()

      // Clean up
      URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: "Your tone has been exported as a WAV file.",
      })
    } catch (error) {
      console.error("Error exporting tone:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your tone.",
        variant: "destructive",
      })
    }
  }

  // Convert AudioBuffer to WAV format
  const bufferToWav = (buffer: AudioBuffer) => {
    const numChannels = buffer.numberOfChannels
    const length = buffer.length * numChannels * 2
    const sampleRate = buffer.sampleRate

    // Create buffer with WAV header
    const arrayBuffer = new ArrayBuffer(44 + length)
    const view = new DataView(arrayBuffer)

    // Write WAV header
    writeString(view, 0, "RIFF")
    view.setUint32(4, 36 + length, true)
    writeString(view, 8, "WAVE")
    writeString(view, 12, "fmt ")
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numChannels * 2, true)
    view.setUint16(32, numChannels * 2, true)
    view.setUint16(34, 16, true)
    writeString(view, 36, "data")
    view.setUint32(40, length, true)

    // Write audio data
    const channels = []
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i))
    }

    let offset = 44
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]))
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
        offset += 2
      }
    }

    return new Blob([view], { type: "audio/wav" })
  }

  // Helper for writing strings to DataView
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case " ": // Space bar
          e.preventDefault()
          togglePlay()
          break
        case "ArrowUp":
          e.preventDefault()
          adjustFrequency(1)
          break
        case "ArrowDown":
          e.preventDefault()
          adjustFrequency(-1)
          break
        case "ArrowLeft":
          e.preventDefault()
          adjustFrequency(-0.1)
          break
        case "ArrowRight":
          e.preventDefault()
          adjustFrequency(0.1)
          break
        case "PageUp":
          e.preventDefault()
          adjustFrequency(10)
          break
        case "PageDown":
          e.preventDefault()
          adjustFrequency(-10)
          break
        case "m":
          setVolume(volume === 0 ? 50 : 0)
          break
        case "s":
          if (e.ctrlKey) {
            e.preventDefault()
            exportTone()
          } else {
            setIsSweeping(!isSweeping)
          }
          break
        case "t":
          setTimerActive(!timerActive)
          break
        case "b":
          if (e.ctrlKey) {
            e.preventDefault()
            addToFavorites()
          }
          break
        case "c":
          if (e.ctrlKey) {
            e.preventDefault()
            copyFrequencyLink()
          }
          break
        case "F1":
          e.preventDefault()
          setShowKeyboardShortcuts(true)
          break
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          setVolume(Number.parseInt(e.key) * 10)
          break
        case "0":
          setVolume(100)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPlaying, frequency, volume, isSweeping, timerActive])

  // Update frequency when playing
  useEffect(() => {
    if (
      isPlaying &&
      oscillatorRef.current &&
      waveType !== "noise-white" &&
      waveType !== "noise-pink" &&
      waveType !== "noise-brown"
    ) {
      oscillatorRef.current.frequency.value = frequency

      // Update harmonics
      Object.entries(harmonicOscillatorsRef.current).forEach(([harmonic, { osc }]) => {
        const harmonicNum = Number.parseInt(harmonic)
        osc.frequency.value = frequency * harmonicNum
      })

      // Update binaural beat
      if (waveType === "binaural" && oscillatorRightRef.current) {
        oscillatorRightRef.current.frequency.value = frequency + binauralBeat
      }
    }
  }, [frequency, isPlaying, waveType, binauralBeat])

  // Update volume when playing
  useEffect(() => {
    if (isPlaying && gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume / 100
    }
  }, [volume, isPlaying])

  // Update panning when playing
  useEffect(() => {
    if (isPlaying && pannerNodeRef.current) {
      pannerNodeRef.current.pan.value = pan
    }
  }, [pan, isPlaying])

  // Update harmonics when playing
  useEffect(() => {
    if (
      isPlaying &&
      oscillatorRef.current &&
      waveType !== "noise-white" &&
      waveType !== "noise-pink" &&
      waveType !== "noise-brown" &&
      waveType !== "binaural"
    ) {
      // Restart to apply new harmonics
      stopTone()
      startTone()
    }
  }, [harmonics])

  // Update wave type when playing
  useEffect(() => {
    if (isPlaying) {
      stopTone()
      startTone()
    }
  }, [waveType])

  // Load URL parameters on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const freqParam = params.get("freq")
      const waveParam = params.get("wave")
      const beatParam = params.get("beat")
      const panParam = params.get("pan")

      if (freqParam) {
        const parsedFreq = Number.parseFloat(freqParam)
        if (!isNaN(parsedFreq) && parsedFreq > 0) {
          setFrequency(parsedFreq)
        }
      }

      if (waveParam) {
        setWaveType(waveParam as WaveType)
      }

      if (beatParam && waveParam === "binaural") {
        const parsedBeat = Number.parseFloat(beatParam)
        if (!isNaN(parsedBeat) && parsedBeat > 0) {
          setBinauralBeat(parsedBeat)
        }
      }

      if (panParam) {
        const parsedPan = Number.parseFloat(panParam)
        if (!isNaN(parsedPan) && parsedPan >= -1 && parsedPan <= 1) {
          setPan(parsedPan)
        }
      }
    }

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("tone-generator-favorites")
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (e) {
        console.error("Error loading favorites:", e)
      }
    }
  }, [])

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("tone-generator-favorites", JSON.stringify(favorites))
  }, [favorites])

  // Update mobile state
  useEffect(() => {
    if (isMobile) {
      setShowSidePanel(false)
    }
  }, [isMobile])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTone()
      stopMicrophoneAnalysis()

      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Adjust frequency by a small amount
  const adjustFrequency = (amount: number) => {
    setFrequency((prev) => {
      // For fine adjustments
      if (Math.abs(amount) < 1) {
        return Number.parseFloat((prev + amount).toFixed(2))
      }
      // For larger adjustments
      return Math.max(0.1, Math.min(20000, prev + amount))
    })
  }

  // Format frequency for display
  const formatFrequency = (freq: number) => {
    const freqq = freq
    if (freqq >= 1000) {
      return `${(freqq / 1000).toFixed(2)} kHz`
    }
    return `${freqq.toFixed(freqq < 10 ? 2 : freqq < 100 ? 1 : 0)} Hz`
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

  // Handle frequency detection from analyzer
  const handleFrequencyDetected = (freq: number) => {
    setFrequency(freq)
    setActiveTab("generator")
  }

  // Toggle side panel
  const toggleSidePanel = () => {
    setShowSidePanel(!showSidePanel)
  }

  // Open side panel with specific content
  const openSidePanel = (content: "info" | "analyzer" | "presets") => {
    if (isMobile) {
      setDrawerContent(content)
      setShowDrawer(true)
    } else {
      setSidePanelContent(content)
      setShowSidePanel(true)
    }
  }

  // Render side panel content
  const renderSidePanelContent = (content: "info" | "analyzer" | "presets") => {
    switch (content) {
      case "info":
        return <FrequencyInfo frequency={frequency} />
      case "analyzer":
        return (
          <ToneAnalyzer
            audioContext={audioContextRef.current}
            initAudio={initAudio}
            onFrequencyDetected={handleFrequencyDetected}
          />
        )
      case "presets":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Tone Presets</CardTitle>
              <CardDescription>Quick access to common frequencies and waveforms</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="music" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="music">Musical</TabsTrigger>
                  <TabsTrigger value="test">Test</TabsTrigger>
                  <TabsTrigger value="therapy">Therapy</TabsTrigger>
                  <TabsTrigger value="special">Special</TabsTrigger>
                </TabsList>

                {["music", "test", "therapy", "special"].map((category) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                      {PRESETS.filter((preset) => preset.category === category).map((preset) => (
                        <Button
                          key={preset.name}
                          variant="outline"
                          className="h-auto py-2 px-3 justify-start flex flex-col items-start"
                          onClick={() =>
                            loadSettings(preset.frequency, preset.waveType, {
                              harmonics: preset.harmonics,
                              binauralBeat: preset.binauralBeat,
                              pan: preset.pan,
                            })
                          }
                        >
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {preset.description || `${preset.frequency} Hz, ${preset.waveType}`}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={`w-full flex flex-col items-center min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-orange-50"}`}
    >
      <div className="w-full max-w-7xl flex flex-col md:flex-row">
        {/* Main content */}
        <div className={`flex-1 p-4 md:p-6 ${showSidePanel && !isMobile ? "md:pr-2" : ""}`}>
          <header className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Waveform className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">Professional Tone Generator</h1>
            </div>

            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                title="Toggle theme"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKeyboardShortcuts(true)}
                className="flex items-center gap-1"
                aria-label="Keyboard shortcuts"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Shortcuts</span>
              </Button>

              {!isMobile && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleSidePanel}
                  title={showSidePanel ? "Hide side panel" : "Show side panel"}
                  aria-label={showSidePanel ? "Hide side panel" : "Show side panel"}
                >
                  {showSidePanel ? <PanelRight className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
                </Button>
              )}
            </div>
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 md:grid-cols-4 mb-4">
              <TabsTrigger value="generator" className="flex items-center gap-1">
                <Waveform className="h-4 w-4" />
                <span>Generator</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-1">
                <Sliders className="h-4 w-4" />
                <span>Advanced</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-1">
                <Bookmark className="h-4 w-4" />
                <span>Favorites</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                <span>Tools</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span>Tone Generator</span>
                      {isPlaying && (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        >
                          Playing
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => addToFavorites()} className="h-8 w-8">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Save to favorites</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openSidePanel("info")}
                              className="h-8 w-8"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Frequency information</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openSidePanel("presets")}
                              className="h-8 w-8"
                            >
                              <Music className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Presets</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Generate precise audio tones with adjustable frequency, volume, and waveform
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Play button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={togglePlay}
                      className="w-32 h-12 text-lg"
                      variant={isPlaying ? "destructive" : "default"}
                    >
                      {isPlaying ? <Square className="mr-2" size={18} /> : <Play className="mr-2" size={18} />}
                      {isPlaying ? "STOP" : "PLAY"}
                    </Button>
                  </div>

                  {/* Frequency display */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-4xl font-bold text-primary">{formatFrequency(frequency)}</div>
                    <div className="text-sm text-muted-foreground">
                      {frequency >= 20 && frequency <= 20000 && `Musical Note: ${findClosestNote(frequency)}`}
                    </div>
                  </div>

                  {/* Frequency slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>20 Hz</span>
                      <span>1 kHz</span>
                      <span>20 kHz</span>
                    </div>
                    <Slider
                      value={[frequency]}
                      min={20}
                      max={20000}
                      step={0.1}
                      onValueChange={(values) => setFrequency(values[0])}
                      className="h-6"
                    />
                  </div>

                  {/* Fine controls */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => adjustFrequency(-10)} className="h-8">
                      -10 Hz
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => adjustFrequency(-1)} className="h-8">
                      -1 Hz
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => adjustFrequency(-0.1)} className="h-8">
                      -0.1 Hz
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => adjustFrequency(0.1)} className="h-8">
                      +0.1 Hz
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => adjustFrequency(1)} className="h-8">
                      +1 Hz
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => adjustFrequency(10)} className="h-8">
                      +10 Hz
                    </Button>
                  </div>

                  {/* Direct frequency input */}
                  <div className="flex items-center gap-2 justify-center">
                    <Label htmlFor="frequency-input" className="text-sm">
                      Frequency:
                    </Label>
                    <Input
                      id="frequency-input"
                      type="number"
                      min="0.1"
                      max="20000"
                      step="0.1"
                      value={frequency}
                      onChange={(e) => setFrequency(Number.parseFloat(e.target.value) || 0)}
                      className="w-32"
                    />
                    <span className="text-sm">Hz</span>
                  </div>

                  {/* Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Volume control */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="volume-slider" className="text-sm">
                          Volume
                        </Label>
                        <span className="text-sm">{volume}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Volume2 size={18} className="text-muted-foreground" />
                        <Slider
                          id="volume-slider"
                          value={[volume]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(values) => setVolume(values[0])}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Wave type selector */}
                    <div className="space-y-2">
                      <Label htmlFor="wave-type" className="text-sm">
                        Waveform
                      </Label>
                      <Select value={waveType} onValueChange={(value) => setWaveType(value as WaveType)}>
                        <SelectTrigger id="wave-type">
                          <SelectValue placeholder="Wave Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Basic Waveforms</SelectLabel>
                            <SelectItem value="sine">Sine Wave (Pure Tone)</SelectItem>
                            <SelectItem value="square">Square Wave</SelectItem>
                            <SelectItem value="sawtooth">Sawtooth Wave</SelectItem>
                            <SelectItem value="triangle">Triangle Wave</SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Noise</SelectLabel>
                            <SelectItem value="noise-white">White Noise</SelectItem>
                            <SelectItem value="noise-pink">Pink Noise</SelectItem>
                            <SelectItem value="noise-brown">Brown Noise</SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Special</SelectLabel>
                            <SelectItem value="binaural">Binaural Beat</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pan control */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="pan-slider" className="text-sm">
                          Pan (L/R Balance)
                        </Label>
                        <span className="text-sm">
                          {pan < 0
                            ? `${Math.abs(pan * 100).toFixed(0)}% L`
                            : pan > 0
                              ? `${(pan * 100).toFixed(0)}% R`
                              : "Center"}
                        </span>
                      </div>
                      <Slider
                        id="pan-slider"
                        value={[pan]}
                        min={-1}
                        max={1}
                        step={0.01}
                        onValueChange={(values) => setPan(values[0])}
                      />
                    </div>

                    {/* Binaural beat control (only shown when binaural is selected) */}
                    {waveType === "binaural" && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="binaural-slider" className="text-sm">
                            Binaural Beat Frequency
                          </Label>
                          <span className="text-sm">{binauralBeat} Hz</span>
                        </div>
                        <Slider
                          id="binaural-slider"
                          value={[binauralBeat]}
                          min={1}
                          max={40}
                          step={0.1}
                          onValueChange={(values) => setBinauralBeat(values[0])}
                        />
                      </div>
                    )}
                  </div>

                  {/* Visualizations */}
                  {showAnalyzer && (
                    <div className="h-40 border rounded-md p-2">
                      <FrequencyVisualizer analyser={analyserNodeRef.current} isPlaying={isPlaying} />
                    </div>
                  )}

                  {showWaveform && (
                    <div className="h-24 border rounded-md p-2">
                      <WaveformVisualizer analyser={analyserNodeRef.current} isPlaying={isPlaying} />
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-wrap justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Switch id="show-analyzer" checked={showAnalyzer} onCheckedChange={setShowAnalyzer} />
                    <Label htmlFor="show-analyzer">Spectrum</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch id="show-waveform" checked={showWaveform} onCheckedChange={setShowWaveform} />
                    <Label htmlFor="show-waveform">Waveform</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Timer</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <h4 className="font-medium">Auto-Stop Timer</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="timer-switch">Enable Timer</Label>
                              <Switch id="timer-switch" checked={timerActive} onCheckedChange={setTimerActive} />
                            </div>

                            {timerActive && (
                              <>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="timer-duration">Duration</Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      id="timer-duration"
                                      type="number"
                                      min="5"
                                      max="3600"
                                      value={timerDuration}
                                      onChange={(e) => setTimerDuration(Number.parseInt(e.target.value) || 300)}
                                      className="w-20"
                                    />
                                    <span className="text-sm">seconds</span>
                                  </div>
                                </div>

                                {isPlaying && (
                                  <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Stopping in:</p>
                                    <p className="text-xl font-bold">{formatTime(timerRemaining)}</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardFooter>
              </Card>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  <p>
                    You can damage your hearing or your speakers if you play tones at extreme volumes or frequencies.
                  </p>
                  <p className="mt-2">
                    People can't hear sounds &lt; 20 Hz and &gt; 20,000 Hz very well. If you turn up the volume on your
                    device to compensate, you could expose yourself to harmful sound levels.
                  </p>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Controls</CardTitle>
                  <CardDescription>Fine-tune your tone with advanced parameters</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Harmonics</h3>
                    <p className="text-sm text-muted-foreground">Add overtones to create richer, more complex sounds</p>

                    {[2, 3, 4, 5].map((harmonic) => (
                      <div key={harmonic} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor={`harmonic-${harmonic}`} className="text-sm">
                            {harmonic}x Harmonic ({(frequency * harmonic).toFixed(1)} Hz)
                          </Label>
                          <span className="text-sm">{harmonics[harmonic]}%</span>
                        </div>
                        <Slider
                          id={`harmonic-${harmonic}`}
                          value={[harmonics[harmonic]]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(values) => {
                            setHarmonics((prev) => ({
                              ...prev,
                              [harmonic]: values[0],
                            }))
                          }}
                        />
                      </div>
                    ))}

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setHarmonics({
                            2: 0,
                            3: 0,
                            4: 0,
                            5: 0,
                          })
                        }}
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset Harmonics
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Frequency Sweep</h3>
                    <p className="text-sm text-muted-foreground">Automatically sweep through a range of frequencies</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sweep-start-adv">Start Frequency (Hz)</Label>
                        <Input
                          id="sweep-start-adv"
                          type="number"
                          min="20"
                          max="20000"
                          value={sweepStart}
                          onChange={(e) => setSweepStart(Number.parseInt(e.target.value) || 100)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sweep-end-adv">End Frequency (Hz)</Label>
                        <Input
                          id="sweep-end-adv"
                          type="number"
                          min="20"
                          max="20000"
                          value={sweepEnd}
                          onChange={(e) => setSweepEnd(Number.parseInt(e.target.value) || 1000)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sweep-duration-adv">Duration (seconds)</Label>
                        <Input
                          id="sweep-duration-adv"
                          type="number"
                          min="1"
                          max="60"
                          value={sweepDuration}
                          onChange={(e) => setSweepDuration(Number.parseInt(e.target.value) || 5)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sweep-type-adv">Sweep Type</Label>
                        <Select
                          value={sweepType}
                          onValueChange={(value) => setSweepType(value as "linear" | "logarithmic")}
                        >
                          <SelectTrigger id="sweep-type-adv">
                            <SelectValue placeholder="Sweep Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="linear">Linear</SelectItem>
                            <SelectItem value="logarithmic">Logarithmic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Switch
                        id="sweep-enable"
                        checked={isSweeping}
                        onCheckedChange={(checked) => {
                          setIsSweeping(checked)
                          if (checked && isPlaying) {
                            stopTone()
                            setTimeout(() => startTone(), 10)
                          }
                        }}
                      />
                      <Label htmlFor="sweep-enable">Enable Frequency Sweep</Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Binaural Beats</h3>
                    <p className="text-sm text-muted-foreground">
                      Create binaural beats by playing slightly different frequencies in each ear
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="binaural-beat-freq" className="text-sm">
                          Beat Frequency
                        </Label>
                        <span className="text-sm">{binauralBeat} Hz</span>
                      </div>
                      <Slider
                        id="binaural-beat-freq"
                        value={[binauralBeat]}
                        min={1}
                        max={40}
                        step={0.1}
                        onValueChange={(values) => setBinauralBeat(values[0])}
                      />
                      <div className="text-xs text-muted-foreground">
                        <p>Common frequencies:</p>
                        <ul className="list-disc list-inside mt-1">
                          <li>Delta (1-4 Hz): Deep sleep, healing</li>
                          <li>Theta (4-8 Hz): Meditation, creativity</li>
                          <li>Alpha (8-13 Hz): Relaxation, calmness</li>
                          <li>Beta (13-30 Hz): Focus, alertness</li>
                        </ul>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setWaveType("binaural")
                        if (isPlaying) {
                          stopTone()
                          setTimeout(() => startTone(), 10)
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <Headphones className="h-4 w-4" />
                      Use Binaural Mode
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex flex-wrap gap-4 justify-center">
                    <PresetManager
                      frequency={frequency}
                      waveType={waveType}
                      harmonics={harmonics}
                      binauralBeat={waveType === "binaural" ? binauralBeat : undefined}
                      pan={pan}
                      onSave={savePreset}
                    />

                    <ShareLink
                      frequency={frequency}
                      waveType={waveType}
                      binauralBeat={waveType === "binaural" ? binauralBeat : undefined}
                    />

                    <AudioExport
                      frequency={frequency}
                      waveType={waveType}
                      volume={volume}
                      harmonics={harmonics}
                      binauralBeat={waveType === "binaural" ? binauralBeat : undefined}
                      pan={pan}
                      audioContext={audioContextRef.current}
                      onExport={exportTone}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Favorites</CardTitle>
                  <CardDescription>Your saved frequency and waveform combinations</CardDescription>
                </CardHeader>

                <CardContent>
                  {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {favorites.map((favorite, index) => (
                        <div key={index} className="flex items-center justify-between border rounded-md p-3">
                          <div>
                            <div className="font-medium">{favorite.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {favorite.frequency} Hz, {favorite.waveType}
                              {favorite.binauralBeat && `, Beat: ${favorite.binauralBeat} Hz`}
                              {favorite.pan !== undefined &&
                                favorite.pan !== 0 &&
                                `, Pan: ${favorite.pan < 0 ? "Left" : "Right"} ${Math.abs(favorite.pan * 100).toFixed(0)}%`}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                loadSettings(favorite.frequency, favorite.waveType, {
                                  harmonics: favorite.harmonics,
                                  binauralBeat: favorite.binauralBeat,
                                  pan: favorite.pan,
                                })
                              }
                              className="h-8 w-8"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setFavorites(favorites.filter((_, i) => i !== index))
                              }}
                              className="h-8 w-8 text-destructive"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>You haven't saved any favorites yet</p>
                      <p className="text-sm mt-2">Use the bookmark icon to save your favorite tones</p>
                    </div>
                  )}
                </CardContent>

                {favorites.length > 0 && (
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear all favorites?")) {
                          setFavorites([])
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Clear All Favorites
                    </Button>
                  </CardFooter>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent History</CardTitle>
                  <CardDescription>Recently used frequencies and waveforms</CardDescription>
                </CardHeader>

                <CardContent>
                  {history.length > 0 ? (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {history.map((item, index) => (
                          <div key={index} className="flex items-center justify-between border rounded-md p-3">
                            <div>
                              <div className="font-medium">{item.frequency} Hz</div>
                              <div className="text-sm text-muted-foreground">
                                {item.waveType}, {new Date(item.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => loadSettings(item.frequency, item.waveType)}
                                className="h-8 w-8"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const name = prompt(
                                    "Enter a name for this favorite:",
                                    `${item.frequency} Hz ${item.waveType}`,
                                  )
                                  if (name) {
                                    setFavorites([
                                      ...favorites,
                                      {
                                        frequency: item.frequency,
                                        waveType: item.waveType,
                                        name,
                                      },
                                    ])
                                  }
                                }}
                                className="h-8 w-8"
                              >
                                <Bookmark className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No history yet</p>
                      <p className="text-sm mt-2">Your recently used tones will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                  onClick={() => openSidePanel("analyzer")}
                >
                  <Mic className="h-8 w-8 text-primary" />
                  <div className="text-lg font-medium">Frequency Analyzer</div>
                  <p className="text-sm text-muted-foreground text-center">
                    Analyze audio input from your microphone to detect frequencies
                  </p>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                  onClick={() => openSidePanel("info")}
                >
                  <Info className="h-8 w-8 text-primary" />
                  <div className="text-lg font-medium">Frequency Information</div>
                  <p className="text-sm text-muted-foreground text-center">
                    Learn about the properties and uses of different frequencies
                  </p>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                  onClick={() => openSidePanel("presets")}
                >
                  <Music className="h-8 w-8 text-primary" />
                  <div className="text-lg font-medium">Tone Presets</div>
                  <p className="text-sm text-muted-foreground text-center">
                    Quick access to common frequencies and waveforms
                  </p>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                  onClick={() => setShowKeyboardShortcuts(true)}
                >
                  <Keyboard className="h-8 w-8 text-primary" />
                  <div className="text-lg font-medium">Keyboard Shortcuts</div>
                  <p className="text-sm text-muted-foreground text-center">
                    View keyboard shortcuts for faster control
                  </p>
                </Button>
              </div>

              <HearingTest audioContext={audioContextRef.current} initAudio={initAudio} />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Therapeutic Frequencies
                  </CardTitle>
                  <CardDescription>Common frequencies used in sound therapy and meditation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      {
                        name: "Delta Waves",
                        freq: 2,
                        desc: "Deep sleep, healing",
                        icon: <Brain className="h-4 w-4" />,
                      },
                      {
                        name: "Theta Waves",
                        freq: 6,
                        desc: "Meditation, creativity",
                        icon: <Zap className="h-4 w-4" />,
                      },
                      {
                        name: "Alpha Waves",
                        freq: 10,
                        desc: "Relaxation, calmness",
                        icon: <Heart className="h-4 w-4" />,
                      },
                      {
                        name: "Schumann Resonance",
                        freq: 7.83,
                        desc: "Earth's frequency",
                        icon: <Globe className="h-4 w-4" />,
                      },
                      {
                        name: "Solfeggio 528 Hz",
                        freq: 528,
                        desc: "DNA repair, transformation",
                        icon: <Zap className="h-4 w-4" />,
                      },
                      {
                        name: "Solfeggio 432 Hz",
                        freq: 432,
                        desc: "Natural tuning",
                        icon: <Music className="h-4 w-4" />,
                      },
                    ].map((item) => (
                      <Button
                        key={item.name}
                        variant="outline"
                        className="h-auto py-3 px-4 justify-start flex flex-col items-start"
                        onClick={() => loadSettings(item.freq, "sine")}
                      >
                        <div className="flex items-center gap-2 font-medium">
                          {item.icon}
                          {item.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.freq} Hz - {item.desc}
                        </div>
                      </Button>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground p-2 border rounded-md">
                    <p className="font-medium flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Important Note:
                    </p>
                    <p className="mt-1">
                      Therapeutic claims about specific frequencies vary in scientific support. Individual experiences
                      may vary, and sound therapy should complement, not replace, professional medical care.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Side panel (desktop only) */}
        {showSidePanel && !isMobile && (
          <div className="hidden md:block w-80 p-4 md:p-6 md:pl-2 shrink-0">
            {renderSidePanelContent(sidePanelContent)}
          </div>
        )}
      </div>

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer open={showDrawer} onOpenChange={setShowDrawer}>
          <DrawerContent className="p-4 max-h-[90vh]">
            <ScrollArea className="h-[70vh]">{renderSidePanelContent(drawerContent)}</ScrollArea>
          </DrawerContent>
        </Drawer>
      )}

      {/* Keyboard shortcuts dialog */}
      <KeyboardShortcuts open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts} />
    </div>
  )
}

