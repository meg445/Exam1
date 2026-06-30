// Emley Junior School (Grade 7-9) & Emley Senior Elite School (Grade 10) Results Analysis - data model & helpers

export type PerformanceLevel = 
  | "EE1" | "EE2" 
  | "ME1" | "ME2" 
  | "AE1" | "AE2" 
  | "BE1" | "BE2"

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
  gender: "Male" | "Female" // Added to resolve the error in createEmptyStudent
  scores: Record<Subject, number>
}

export interface StudentResult extends Student {
  total: number
  mean: number
  level: PerformanceLevel
  rank: number
}

// CBC 8-point competency bands
export const PERFORMANCE_LEVELS: {
  level: PerformanceLevel
  label: string
  min: number
  max: number
}[] = [
  { level: "EE1", label: "Exceeding Expectation 1", min: 90, max: 100 },
  { level: "EE2", label: "Exceeding Expectation 2", min: 75, max: 89 },
  { level: "ME1", label: "Meeting Expectation 1", min: 58, max: 74 },
  { level: "ME2", label: "Meeting Expectation 2", min: 41, max: 57 },
  { level: "AE1", label: "Approaching Expectation 1", min: 31, max: 40 },
  { level: "AE2", label: "Approaching Expectation 2", min: 21, max: 30 },
  { level: "BE1", label: "Below Expectation 1", min: 11, max: 20 },
  { level: "BE2", label: "Below Expectation 2", min: 0, max: 10 },
]

export function getPerformanceLevel(score: number): PerformanceLevel {
  if (score >= 90) return "EE1"
  if (score >= 75) return "EE2"
  if (score >= 58) return "ME1"
  if (score >= 41) return "ME2"
  if (score >= 31) return "AE1"
  if (score >= 21) return "AE2"
  if (score >= 11) return "BE1"
  return "BE2"
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
  const dist: Record<PerformanceLevel, number> = { 
    EE1: 0, EE2: 0, 
    ME1: 0, ME2: 0, 
    AE1: 0, AE2: 0, 
    BE1: 0, BE2: 0 
  }
  
  for (const s of students) {
    dist[getPerformanceLevel(s.scores[subject])] += 1
  }
  return dist
}

// Build the starting roster for each grade. Grade 8 is seeded with the sample
// class for demonstration; Grade 7, 9, and 10 start empty.
// (Assuming SAMPLE_STUDENTS is imported or defined elsewhere in your file)
export function createInitialGradeMap(): Record<Grade, Student[]> {
  return {
    "Grade 7": [],
    "Grade 8": SAMPLE_STUDENTS.map((s) => ({ ...s, scores: { ...s.scores } })),
    "Grade 9": [],
    "Grade 10": [],
  }
}