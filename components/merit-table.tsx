import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  SUBJECTS,
  computeResults,
  subjectMean,
  subjectDistribution,
  getPerformanceLevel,
  type Student,
  type PerformanceLevel,
} from "@/lib/results-data"

const levelStyles: Record<PerformanceLevel, string> = {
  EE: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  ME: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  AE: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  BE: "bg-destructive/15 text-destructive border-destructive/30",
}

export function MeritTable({ students }: { students: Student[] }) {
  const results = computeResults(students)
  const levels: PerformanceLevel[] = ["EE", "ME", "AE", "BE"]
  const classMean =
    results.reduce((acc, r) => acc + r.mean, 0) / (results.length || 1)

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary hover:bg-secondary">
            <TableHead className="sticky left-0 z-10 bg-secondary text-secondary-foreground">
              Rank
            </TableHead>
            <TableHead className="text-secondary-foreground">Adm No.</TableHead>
            <TableHead className="text-secondary-foreground">Student Name</TableHead>
            <TableHead className="text-secondary-foreground">Gender</TableHead>
            {SUBJECTS.map((subj) => (
              <TableHead
                key={subj}
                colSpan={2}
                className="border-l border-border text-center text-secondary-foreground"
              >
                <div className="whitespace-nowrap">{subj}</div>
                <div className="text-xs font-normal text-muted-foreground">Score / Level</div>
              </TableHead>
            ))}
            <TableHead className="text-center text-secondary-foreground">Total</TableHead>
            <TableHead className="text-center text-secondary-foreground">Mean</TableHead>
            <TableHead className="text-center text-secondary-foreground">Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((r) => (
            <TableRow key={r.admissionNumber}>
              <TableCell className="sticky left-0 z-10 bg-card font-bold tabular-nums">
                {r.rank}
              </TableCell>
              <TableCell className="whitespace-nowrap font-mono text-sm text-muted-foreground">
                {r.admissionNumber}
              </TableCell>
              <TableCell className="whitespace-nowrap font-medium">{r.fullName}</TableCell>
              <TableCell className="text-muted-foreground">{r.gender}</TableCell>
              {SUBJECTS.map((subj) => {
                const score = r.scores[subj]
                const level = getPerformanceLevel(score)
                return (
                  <TableCell key={`${subj}-score`} className="border-l border-border/50 text-center tabular-nums">
                    {score}
                  </TableCell>
                )
              })}
              {SUBJECTS.map((subj) => {
                const score = r.scores[subj]
                const level = getPerformanceLevel(score)
                return (
                  <TableCell key={`${subj}-level`} className="text-center">
                    <Badge
                      variant="outline"
                      className={cn("font-semibold text-xs", levelStyles[level])}
                    >
                      {level}
                    </Badge>
                  </TableCell>
                )
              })}
              <TableCell className="text-center font-semibold tabular-nums">
                {r.total}
              </TableCell>
              <TableCell className="text-center font-semibold tabular-nums">
                {r.mean.toFixed(2)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className={cn("font-semibold", levelStyles[r.level])}>
                  {r.level}
                </Badge>
              </TableCell>
            </TableRow>
          ))}

          {/* Subject mean score summary */}
          <TableRow className="border-t-2 border-border bg-muted/60 font-semibold hover:bg-muted/60">
            <TableCell colSpan={4} className="sticky left-0 z-10 bg-muted/60">
              Subject Mean Score
            </TableCell>
            {SUBJECTS.map((subj) => (
              <TableCell key={`mean-${subj}`} className="border-l border-border/50 text-center tabular-nums">
                {subjectMean(students, subj).toFixed(2)}
              </TableCell>
            ))}
            {SUBJECTS.map((subj) => (
              <TableCell key={`mean-level-${subj}`} className="text-center text-muted-foreground text-sm">
                —
              </TableCell>
            ))}
            <TableCell />
            <TableCell className="text-center tabular-nums">{classMean.toFixed(2)}</TableCell>
            <TableCell />
          </TableRow>

          {/* Subject grade distribution */}
          {levels.map((level) => (
            <TableRow key={level} className="bg-muted/30 text-sm hover:bg-muted/30">
              <TableCell colSpan={4} className="sticky left-0 z-10 bg-muted/30 text-muted-foreground">
                No. of {level}
              </TableCell>
              {SUBJECTS.map((subj) => {
                const dist = subjectDistribution(students, subj)
                return (
                  <TableCell key={`dist-${subj}`} className="border-l border-border/50 text-center tabular-nums text-muted-foreground">
                    {dist[level]}
                  </TableCell>
                )
              })}
              {SUBJECTS.map((subj) => (
                <TableCell key={`dist-level-${subj}`} className="text-center text-muted-foreground">
                  —
                </TableCell>
              ))}
              <TableCell />
              <TableCell />
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
