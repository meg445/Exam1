// Kenyan Junior School (Grade 7-9 / JSS) Results Analysis - data model & helpers

export type PerformanceLevel = "EE" | "ME" | "AE" | "BE"

// Junior School grade levels
export const GRADES = ["Grade 7", "Grade 8", "Grade 9", "Grade 10"] as const
export type Grade = (typeof GRADES)[number]

// The 9 official Junior School learning areas
export const SUBJECTS = [
  "English",
  "Kiswahili",
  "Mathematics",
  "Integrated Science",
  "Social Studies",
  "Pre-Technical Studies",
  "Agriculture & Nutrition",
  "Creative Arts & Sports",
  "Religious Education",
] as const

export type Subject = (typeof SUBJECTS)[number]

export interface Student {
  admissionNumber: string
  fullName: string
  scores: Record<Subject, number>
}

export interface StudentResult extends Student {
  total: number
  mean: number
  level: PerformanceLevel
  rank: number
}

// CBC competency bands (score out of 100)
export const PERFORMANCE_LEVELS: {
  level: PerformanceLevel
  label: string
  min: number
  max: number
}[] = [
  { level: "EE", label: "Exceeding Expectation", min: 76, max: 100 },
  { level: "ME", label: "Meeting Expectation", min: 51, max: 75 },
  { level: "AE", label: "Approaching Expectation", min: 26, max: 50 },
  { level: "BE", label: "Below Expectation", min: 0, max: 25 },
]

export function getPerformanceLevel(score: number): PerformanceLevel {
  if (score >= 76) return "EE"
  if (score >= 51) return "ME"
  if (score >= 26) return "AE"
  return "BE"
}

// Create a blank student with all subject scores set to 0
export function createEmptyStudent(): Student {
  const scores = SUBJECTS.reduce(
    (acc, subj) => {
      acc[subj] = 0
      return acc
    },
    {} as Record<Subject, number>,
  )
  return {
    admissionNumber: "",
    fullName: "",
    gender: "Male",
    scores,
  }
}

// Build ranked results from raw students: total, mean, level, rank (highest mean first)
export function computeResults(students: Student[]): StudentResult[] {
  const withMetrics = students.map((s) => {
    const values = SUBJECTS.map((subj) => s.scores[subj])
    const total = values.reduce((a, b) => a + b, 0)
    const mean = total / SUBJECTS.length
    return {
      ...s,
      total,
      mean,
      level: getPerformanceLevel(mean),
    }
  })

  withMetrics.sort((a, b) => b.mean - a.mean)

  return withMetrics.map((s, i) => ({ ...s, rank: i + 1 }))
}

// Class average for a single subject
export function subjectMean(students: Student[], subject: Subject): number {
  if (students.length === 0) return 0
  const sum = students.reduce((acc, s) => acc + s.scores[subject], 0)
  return sum / students.length
}

// Count of each performance level achieved within a single subject
export function subjectDistribution(
  students: Student[],
  subject: Subject,
): Record<PerformanceLevel, number> {
  const dist: Record<PerformanceLevel, number> = { EE: 0, ME: 0, AE: 0, BE: 0 }
  for (const s of students) {
    dist[getPerformanceLevel(s.scores[subject])] += 1
  }
  return dist
}


]

// Build the starting roster for each grade. Grade 8 is seeded with the sample
// class for demonstration; Grade 7 and Grade 9 start empty.
export function createInitialGradeMap(): Record<Grade, Student[]> {
  return {
    "Grade 7": [],
    "Grade 8": SAMPLE_STUDENTS.map((s) => ({ ...s, scores: { ...s.scores } })),
    "Grade 9": [],
  }
}
