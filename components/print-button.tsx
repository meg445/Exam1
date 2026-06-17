
"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PrintButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      className="gap-2 bg-transparent"
      title="Print the current page"
    >
      <Printer className="size-4" aria-hidden="true" />
      Print
    </Button>
  )
}