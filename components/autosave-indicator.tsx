"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export type AutosaveStatus = "idle" | "saving" | "saved" | "error"

interface AutosaveIndicatorProps {
  status: AutosaveStatus
  lastSavedTime?: Date
}

export function AutosaveIndicator({ status, lastSavedTime }: AutosaveIndicatorProps) {
  const [displayTime, setDisplayTime] = useState<string>("")

  useEffect(() => {
    if (!lastSavedTime) return

    const updateTime = () => {
      const now = new Date()
      const diff = now.getTime() - lastSavedTime.getTime()
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)

      if (seconds < 60) {
        setDisplayTime("just now")
      } else if (minutes < 60) {
        setDisplayTime(`${minutes}m ago`)
      } else {
        setDisplayTime(`${Math.floor(minutes / 60)}h ago`)
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [lastSavedTime])

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
        status === "saved" && "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
        status === "saving" && "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
        status === "error" && "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
        status === "idle" && "text-muted-foreground",
      )}
    >
      {status === "saved" && <CheckCircle2 className="size-4 flex-shrink-0" />}
      {status === "saving" && <Clock className="size-4 animate-spin flex-shrink-0" />}
      {status === "error" && <AlertCircle className="size-4 flex-shrink-0" />}

      <span className="line-clamp-1">
        {status === "saved" && `Saved ${displayTime}`}
        {status === "saving" && "Saving..."}
        {status === "error" && "Save failed"}
        {status === "idle" && ""}
      </span>
    </div>
  )
}
