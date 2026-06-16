import { GraduationCap, Users, TrendingUp, Award } from "lucide-react"
import { Card } from "@/components/ui/card"
import { DownloadMeritButton } from "@/components/download-merit-button"
import { MeritTable } from "@/components/merit-table"
import {
  SAMPLE_STUDENTS,
  computeResults,
  getPerformanceLevel,
} from "@/lib/results-data"

export default function Page() {
  const results = computeResults(SAMPLE_STUDENTS)
  const classMean =
    results.reduce((acc, r) => acc + r.mean, 0) / (results.length || 1)
  const topStudent = results[0]
  const eeCount = results.filter((r) => getPerformanceLevel(r.mean) === "EE").length

  const stats = [
    {
      label: "Total Students",
      value: results.length.toString(),
      icon: Users,
    },
    {
      label: "Class Mean Score",
      value: classMean.toFixed(2),
      icon: TrendingUp,
    },
    {
      label: "Top Performer",
      value: topStudent?.fullName ?? "—",
      icon: Award,
    },
    {
      label: "Exceeding Expectation",
      value: `${eeCount} learners`,
      icon: GraduationCap,
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-balance">
                Junior School Results Analysis
              </h1>
              <p className="text-sm text-muted-foreground">
                Grade 8 — Eagle Stream · End of Term Assessment
              </p>
            </div>
          </div>
          <DownloadMeritButton students={SAMPLE_STUDENTS} />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Stats */}
        <section
          aria-label="Class summary"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <Card key={stat.label} className="flex items-center gap-4 p-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <stat.icon className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="truncate text-xl font-bold">{stat.value}</p>
              </div>
            </Card>
          ))}
        </section>

        {/* Merit list */}
        <section aria-label="Compiled merit list" className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Compiled Merit List</h2>
              <p className="text-sm text-muted-foreground">
                Ranked highest to lowest mean. Summary rows show subject averages and grade
                distribution.
              </p>
            </div>
          </div>
          <MeritTable students={SAMPLE_STUDENTS} />
        </section>

        {/* Legend */}
        <section aria-label="Performance levels key" className="mt-6">
          <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-sm">
            <span className="font-medium">Performance Levels:</span>
            <span>
              <strong>EE</strong> Exceeding (76–100)
            </span>
            <span>
              <strong>ME</strong> Meeting (51–75)
            </span>
            <span>
              <strong>AE</strong> Approaching (26–50)
            </span>
            <span>
              <strong>BE</strong> Below (0–25)
            </span>
          </Card>
        </section>
      </div>
    </main>
  )
}
