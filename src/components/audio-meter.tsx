"use client"

import { useRef, useEffect } from "react"

interface AudioMeterProps {
  analyser: AnalyserNode | null
  isActive: boolean
  width?: number
  height?: number
}

export default function AudioMeter({ analyser, isActive, width = 30, height = 150 }: AudioMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Draw meter
    const draw = () => {
      if (!analyser || !isActive) return

      // Get audio data
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyser.getByteFrequencyData(dataArray)

      // Calculate average volume
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i]
      }
      const average = sum / bufferLength

      // Map to 0-1 range
      const level = average / 255

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw background
      ctx.fillStyle = "#f0f0f0"
      ctx.fillRect(0, 0, width, height)

      // Draw meter
      const meterHeight = height * level

      // Create gradient
      const gradient = ctx.createLinearGradient(0, height, 0, 0)
      gradient.addColorStop(0, "#4ade80") // green
      gradient.addColorStop(0.6, height, 0, 0)
      gradient.addColorStop(0, "#4ade80") // green
      gradient.addColorStop(0.6, "#facc15") // yellow
      gradient.addColorStop(1, "#ef4444") // red

      ctx.fillStyle = gradient
      ctx.fillRect(0, height - meterHeight, width, meterHeight)

      // Draw level markers
      ctx.strokeStyle = "rgba(0, 0, 0, 0.2)"
      ctx.lineWidth = 1

      // Draw markers at 25%, 50%, 75% and 100%
      for (let i = 0.25; i <= 1; i += 0.25) {
        const y = height * (1 - i)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw border
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
      ctx.lineWidth = 1
      ctx.strokeRect(0, 0, width, height)

      animationRef.current = requestAnimationFrame(draw)
    }

    if (isActive) {
      draw()
    } else {
      // Draw empty state
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = "#f0f0f0"
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
      ctx.lineWidth = 1
      ctx.strokeRect(0, 0, width, height)

      // Draw level markers
      ctx.strokeStyle = "rgba(0, 0, 0, 0.2)"
      for (let i = 0.25; i <= 1; i += 0.25) {
        const y = height * (1 - i)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [analyser, isActive, width, height])

  return <canvas ref={canvasRef} style={{ width, height }} />
}

