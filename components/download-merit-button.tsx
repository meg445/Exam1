"use client"

import { useState } from "react"
import { Download, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { downloadMeritList } from "@/lib/excel-export"
import type { Student } from "@/lib/results-data"

export function DownloadMeritButton({ students }: { students: Student[] }) {
  const [status, setStatus] = useState<"idle" | "working" | "done">("idle")

  async function handleClick() {
    try {
      setStatus("working")
      await downloadMeritList(students)
      setStatus("done")
      setTimeout(() => setStatus("idle"), 2500)
    } catch (err) {
      console.log("[v0] Excel export failed:", err)
      setStatus("idle")
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={status === "working"}
      size="lg"
      className="h-14 gap-3 rounded-xl bg-primary px-7 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-80"
    >
      {status === "working" ? (
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      ) : status === "done" ? (
        <Check className="size-5" aria-hidden="true" />
      ) : (
        <Download className="size-5" aria-hidden="true" />
      )}
      {status === "working"
        ? "Generating Excel…"
        : status === "done"
          ? "Downloaded!"
          : "Download Compiled Merit List"}
    </Button>
  )
}
