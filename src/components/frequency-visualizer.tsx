"use client"

import { useRef, useEffect } from "react"

interface FrequencyVisualizerProps {
  analyser: AnalyserNode | null
  isPlaying: boolean
}

export default function FrequencyVisualizer({ analyser, isPlaying }: FrequencyVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Draw frequency data
    const draw = () => {
      if (!analyser || !isPlaying) return

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyser.getByteFrequencyData(dataArray)

      const width = canvas.width / window.devicePixelRatio
      const height = canvas.height / window.devicePixelRatio

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw frequency bars
      const barWidth = width / (bufferLength / 4)
      let x = 0

      // Create gradient
      const gradient = ctx.createLinearGradient(0, height, 0, 0)
      gradient.addColorStop(0, "rgba(0, 122, 255, 0.5)")
      gradient.addColorStop(1, "rgba(255, 45, 85, 0.8)")

      ctx.fillStyle = gradient

      for (let i = 0; i < bufferLength / 4; i++) {
        const barHeight = (dataArray[i] / 255) * height

        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight)

        x += barWidth
      }

      // Draw frequency labels
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"

      const labels = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]

      labels.forEach((freq) => {
        // Convert frequency to position
        // Logarithmic scale: x position is proportional to log(frequency)
        const logFreq = Math.log10(freq)
        const logMin = Math.log10(20)
        const logMax = Math.log10(20000)
        const xPos = ((logFreq - logMin) / (logMax - logMin)) * width

        if (xPos >= 0 && xPos <= width) {
          ctx.fillText(freq >= 1000 ? `${freq / 1000}k` : `${freq}`, xPos, height - 5)
        }
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    if (isPlaying) {
      draw()
    } else {
      // Draw empty state
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(
        "Frequency Spectrum (Play to visualize)",
        canvas.width / 2 / window.devicePixelRatio,
        canvas.height / 2 / window.devicePixelRatio,
      )
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [analyser, isPlaying])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

