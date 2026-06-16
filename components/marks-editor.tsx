"use client"

import { Trash2, UserPlus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  SUBJECTS,
  getPerformanceLevel,
  type Student,
  type Subject,
  type PerformanceLevel,
} from "@/lib/results-data"

const levelStyles: Record<PerformanceLevel, string> = {
  EE: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  ME: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  AE: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  BE: "bg-destructive/15 text-destructive border-destructive/30",
}

interface MarksEditorProps {
  students: Student[]
  onChange: (students: Student[]) => void
  onAdd: () => void
  onReset: () => void
}

export function MarksEditor({ students, onChange, onAdd, onReset }: MarksEditorProps) {
  function updateField(index: number, field: "admissionNumber" | "fullName", value: string) {
    const next = students.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    onChange(next)
  }

  function updateGender(index: number, value: "Male" | "Female") {
    const next = students.map((s, i) => (i === index ? { ...s, gender: value } : s))
    onChange(next)
  }

  function updateScore(index: number, subject: Subject, raw: string) {
    let value = Number.parseInt(raw, 10)
    if (Number.isNaN(value)) value = 0
    value = Math.max(0, Math.min(100, value))
    const next = students.map((s, i) =>
      i === index ? { ...s, scores: { ...s.scores, [subject]: value } } : s,
    )
    onChange(next)
  }

  function removeStudent(index: number) {
    onChange(students.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Enter Learner Marks</h2>
          <p className="text-sm text-muted-foreground">
            Type each learner&apos;s details and subject marks (0–100). The performance level for every
            subject is calculated automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onReset} className="gap-2 bg-transparent">
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset
          </Button>
          <Button onClick={onAdd} className="gap-2">
            <UserPlus className="size-4" aria-hidden="true" />
            Add Learner
          </Button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No learners yet. Click <strong>Add Learner</strong> to start entering marks.
        </div>
      ) : (
        <div className="space-y-4">
          {students.map((student, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              {/* Identity row */}
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Admission No.
                  </label>
                  <Input
                    value={student.admissionNumber}
                    onChange={(e) => updateField(index, "admissionNumber", e.target.value)}
                    placeholder="JSS/0001"
                    className="w-32 font-mono"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Learner Name
                  </label>
                  <Input
                    value={student.fullName}
                    onChange={(e) => updateField(index, "fullName", e.target.value)}
                    placeholder="Full name"
                    className="min-w-44"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Gender</label>
                  <Select
                    value={student.gender}
                    onValueChange={(v) => updateGender(index, v as "Male" | "Female")}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStudent(index)}
                  aria-label={`Remove ${student.fullName || "learner"}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>

              {/* Subject marks grid */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {SUBJECTS.map((subject) => {
                  const level = getPerformanceLevel(student.scores[subject])
                  return (
                    <div key={subject} className="flex flex-col gap-1.5">
                      <label className="line-clamp-1 text-xs font-medium text-foreground" title={subject}>
                        {subject}
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={student.scores[subject]}
                          onChange={(e) => updateScore(index, subject, e.target.value)}
                          className="w-16 tabular-nums"
                        />
                        <Badge
                          variant="outline"
                          className={cn("font-semibold", levelStyles[level])}
                        >
                          {level}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
