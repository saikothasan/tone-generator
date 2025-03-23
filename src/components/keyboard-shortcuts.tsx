"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Keyboard } from "lucide-react"

interface KeyboardShortcutsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  const shortcuts = [
    { key: "Space", description: "Play/Stop" },
    { key: "Up Arrow", description: "Increase frequency by 1 Hz" },
    { key: "Down Arrow", description: "Decrease frequency by 1 Hz" },
    { key: "Left Arrow", description: "Decrease frequency by 0.1 Hz" },
    { key: "Right Arrow", description: "Increase frequency by 0.1 Hz" },
    { key: "Page Up", description: "Increase frequency by 10 Hz" },
    { key: "Page Down", description: "Decrease frequency by 10 Hz" },
    { key: "M", description: "Mute/Unmute" },
    { key: "1-9", description: "Set volume (10% to 90%)" },
    { key: "0", description: "Set volume to 100%" },
    { key: "S", description: "Toggle frequency sweep" },
    { key: "T", description: "Toggle timer" },
    { key: "Ctrl+S", description: "Export as audio file" },
    { key: "Ctrl+C", description: "Copy frequency link" },
    { key: "Ctrl+B", description: "Save as favorite" },
    { key: "F1", description: "Show this help dialog" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>Use these keyboard shortcuts for faster control of the tone generator.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 py-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="col-span-1">
              <div className="font-medium flex items-center">
                <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-semibold">
                  {shortcut.key}
                </kbd>
              </div>
              <div>{shortcut.description}</div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

