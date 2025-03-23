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
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type WaveType = OscillatorType | "noise-white" | "noise-pink" | "noise-brown" | "binaural"

interface PresetManagerProps {
  frequency: number
  waveType: WaveType
  harmonics: { [key: number]: number }
  binauralBeat?: number
  pan: number
  onSave: (preset: {
    name: string
    frequency: number
    waveType: WaveType
    harmonics: { [key: number]: number }
    binauralBeat?: number
    pan: number
    category: string
  }) => void
}

export default function PresetManager({
  frequency,
  waveType,
  harmonics,
  binauralBeat,
  pan,
  onSave,
}: PresetManagerProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("custom")

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your preset.",
        variant: "destructive",
      })
      return
    }

    onSave({
      name,
      frequency,
      waveType,
      harmonics,
      binauralBeat,
      pan,
      category,
    })

    setOpen(false)
    setName("")

    toast({
      title: "Preset Saved",
      description: `"${name}" has been added to your presets.`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          <span>Save Preset</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Current Settings</DialogTitle>
          <DialogDescription>Create a preset with your current tone generator settings.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="preset-name" className="text-right">
              Name
            </Label>
            <Input
              id="preset-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Tone"
              className="col-span-3"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="preset-category" className="text-right">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="preset-category" className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="music">Musical</SelectItem>
                <SelectItem value="therapy">Therapeutic</SelectItem>
                <SelectItem value="test">Test Tones</SelectItem>
                <SelectItem value="special">Special</SelectItem>
              </SelectContent>
            </Select>
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
              {waveType === "binaural" && binauralBeat && (
                <p>
                  <strong>Beat Frequency:</strong> {binauralBeat} Hz
                </p>
              )}
              {Object.entries(harmonics).some(([_, value]) => value > 0) && (
                <p>
                  <strong>Harmonics:</strong> Enabled
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Preset</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

