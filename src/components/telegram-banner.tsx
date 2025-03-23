"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BellIcon as BrandTelegram, X } from "lucide-react"
import Link from "next/link"

export default function TelegramBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="w-full bg-[#0088cc] text-white py-2 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <BrandTelegram className="h-5 w-5" />
        <span className="text-sm font-medium">Join our Telegram community for updates and support!</span>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="secondary" size="sm" className="bg-white text-[#0088cc] hover:bg-white/90">
          <Link href="https://t.me/drkingbd" target="_blank" rel="noopener noreferrer">
            Join Now
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white hover:bg-[#0088cc]/20"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </div>
  )
}

