"use client"

import { useRef, useEffect } from "react"

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null
  isPlaying: boolean
}

export default function WaveformVisualizer({ analyser, isPlaying }: WaveformVisualizerProps) {
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

    // Draw waveform data
    const draw = () => {
      if (!analyser || !isPlaying) return

      const bufferLength = analyser.fftSize
      const dataArray = new Uint8Array(bufferLength)
      analyser.getByteTimeDomainData(dataArray)

      const width = canvas.width / window.devicePixelRatio
      const height = canvas.height / window.devicePixelRatio

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw waveform
      ctx.lineWidth = 2
      ctx.strokeStyle = "rgba(0, 122, 255, 0.8)"
      ctx.beginPath()

      const sliceWidth = width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.lineTo(width, height / 2)
      ctx.stroke()

      animationRef.current = requestAnimationFrame(draw)
    }

    if (isPlaying) {
      draw()
    } else {
      // Draw empty state
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = "rgba(0, 0, 0, 0.2)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, canvas.height / 2 / window.devicePixelRatio)
      ctx.lineTo(canvas.width / window.devicePixelRatio, canvas.height / 2 / window.devicePixelRatio)
      ctx.stroke()

      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(
        "Waveform (Play to visualize)",
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

