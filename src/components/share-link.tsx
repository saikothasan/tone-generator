"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Copy, Share2, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type WaveType = OscillatorType | "noise-white" | "noise-pink" | "noise-brown" | "binaural"

interface ShareLinkProps {
  frequency: number
  waveType: WaveType
  binauralBeat?: number
}

export default function ShareLink({ frequency, waveType, binauralBeat }: ShareLinkProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateShareLink = () => {
    const url = new URL(window.location.href)
    url.search = ""

    const params = new URLSearchParams()
    params.set("freq", frequency.toString())
    params.set("wave", waveType)

    if (waveType === "binaural" && binauralBeat) {
      params.set("beat", binauralBeat.toString())
    }

    return `${url.toString()}?${params.toString()}`
  }

  const copyLink = () => {
    const link = generateShareLink()
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)

        toast({
          title: "Link Copied",
          description: "Share link copied to clipboard.",
        })
      })
      .catch((err) => {
        console.error("Failed to copy link", err)
        toast({
          title: "Copy Failed",
          description: "Could not copy to clipboard.",
          variant: "destructive",
        })
      })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Tone Settings</DialogTitle>
          <DialogDescription>Share a link to these exact tone generator settings.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Current Settings</p>
            <div className="text-sm">
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
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Input value={generateShareLink()} readOnly className="flex-1" />
            <Button size="sm" className="px-3" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Anyone with this link will be able to access these exact tone settings.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

