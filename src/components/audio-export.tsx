"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Download, FileAudio } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type WaveType = OscillatorType | "noise-white" | "noise-pink" | "noise-brown" | "binaural"

interface AudioExportProps {
  frequency: number
  waveType: WaveType
  volume: number
  harmonics: { [key: number]: number }
  binauralBeat?: number
  pan: number
  audioContext: AudioContext | null
  onExport: () => void
}

export default function AudioExport({
  frequency,
  waveType,
  volume,
  harmonics,
  binauralBeat,
  pan,
  audioContext,
  onExport,
}: AudioExportProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState(`tone_${frequency}Hz_${waveType}`)
  const [duration, setDuration] = useState(5)
  const [format, setFormat] = useState("wav")

  const handleExport = () => {
    if (!fileName.trim()) {
      toast({
        title: "Filename Required",
        description: "Please enter a name for your audio file.",
        variant: "destructive",
      })
      return
    }

    onExport()
    setOpen(false)

    toast({
      title: "Export Started",
      description: "Your audio file is being prepared for download.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Export Audio</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Audio File</DialogTitle>
          <DialogDescription>Save your current tone as an audio file.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file-name" className="text-right">
              Filename
            </Label>
            <Input
              id="file-name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="col-span-3"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file-format" className="text-right">
              Format
            </Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="file-format" className="col-span-3">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wav">WAV (Uncompressed)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration-slider" className="text-right">
              Duration
            </Label>
            <div className="col-span-3 space-y-2">
              <Slider
                id="duration-slider"
                value={[duration]}
                min={1}
                max={30}
                step={1}
                onValueChange={(values) => setDuration(values[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 second</span>
                <span>{duration} seconds</span>
                <span>30 seconds</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-muted-foreground">Settings</Label>
            <div className="col-span-3 text-sm">
              <p>
                <strong>Frequency:</strong> {frequency} Hz
              </p>
              <p>
                <strong>Waveform:</strong> {waveType}
              </p>
              <p>
                <strong>Sample Rate:</strong> {audioContext ? audioContext.sampleRate : 44100} Hz
              </p>
              <p>
                <strong>Channels:</strong> Stereo
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <FileAudio className="h-4 w-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

