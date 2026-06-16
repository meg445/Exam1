"use client"

import { useRef, useState } from "react"
import { FileDown, Upload, Loader2, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { downloadMarksTemplate, parseMarksWorkbook } from "@/lib/excel-export"
import type { Student } from "@/lib/results-data"

export function MarksImport({
  students,
  onImport,
}: {
  students: Student[]
  onImport: (students: Student[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [tplStatus, setTplStatus] = useState<"idle" | "working" | "done">("idle")
  const [uploadStatus, setUploadStatus] = useState<"idle" | "working" | "done">("idle")
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null)

  async function handleTemplate() {
    try {
      setTplStatus("working")
      await downloadMarksTemplate(students)
      setTplStatus("done")
      setTimeout(() => setTplStatus("idle"), 2500)
    } catch (err) {
      console.log("[v0] Template download failed:", err)
      setTplStatus("idle")
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMessage(null)
    try {
      setUploadStatus("working")
      const parsed = await parseMarksWorkbook(file)
      onImport(parsed)
      setUploadStatus("done")
      setMessage({ kind: "ok", text: `Imported ${parsed.length} learners from "${file.name}".` })
      setTimeout(() => setUploadStatus("idle"), 2500)
    } catch (err) {
      console.log("[v0] Marks import failed:", err)
      setUploadStatus("idle")
      setMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "Could not read that file.",
      })
    } finally {
      // allow re-uploading the same file
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Import Marks from Excel</h2>
        <p className="text-sm text-muted-foreground">
          Download the blank template with learner names and subjects, fill in the scores, then
          upload it to load the marks automatically.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={handleTemplate}
          disabled={tplStatus === "working"}
          className="gap-2"
        >
          {tplStatus === "working" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : tplStatus === "done" ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <FileDown className="size-4" aria-hidden="true" />
          )}
          {tplStatus === "done" ? "Template downloaded" : "Download Blank Template"}
        </Button>

        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadStatus === "working"}
          className="gap-2"
        >
          {uploadStatus === "working" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : uploadStatus === "done" ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Upload className="size-4" aria-hidden="true" />
          )}
          {uploadStatus === "working" ? "Reading file…" : "Upload Marks from Excel"}
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
          className="sr-only"
          aria-label="Upload marks Excel file"
        />
      </div>

      {message && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
            message.kind === "ok"
              ? "border-border bg-accent text-accent-foreground"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {message.kind === "ok" ? (
            <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  )
}
