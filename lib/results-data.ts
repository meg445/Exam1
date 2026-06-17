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

// Sample class roster (Grade 8 - Eagle stream) for demonstration
export const SAMPLE_STUDENTS: Student[] = [
  {
    admissionNumber: "JSS/0421",
    fullName: "Achieng Atieno",
    gender: "Female",
    scores: {
      English: 82,
      Kiswahili: 78,
      Mathematics: 91,
      "Integrated Science": 88,
      "Social Studies": 74,
      "Pre-Technical Studies": 80,
      "Agriculture & Nutrition": 85,
      "Creative Arts & Sports": 90,
      "Religious Education": 77,
    },
  },
  {
    admissionNumber: "JSS/0388",
    fullName: "Brian Kipchoge",
    gender: "Male",
    scores: {
      English: 65,
      Kiswahili: 70,
      Mathematics: 58,
      "Integrated Science": 72,
      "Social Studies": 68,
      "Pre-Technical Studies": 61,
      "Agriculture & Nutrition": 74,
      "Creative Arts & Sports": 66,
      "Religious Education": 71,
    },
  },
  {
    admissionNumber: "JSS/0455",
    fullName: "Cynthia Wanjiru",
    gender: "Female",
    scores: {
      English: 90,
      Kiswahili: 85,
      Mathematics: 95,
      "Integrated Science": 92,
      "Social Studies": 88,
      "Pre-Technical Studies": 84,
      "Agriculture & Nutrition": 89,
      "Creative Arts & Sports": 91,
      "Religious Education": 86,
    },
  },
  {
    admissionNumber: "JSS/0402",
    fullName: "David Mwangi",
    gender: "Male",
    scores: {
      English: 45,
      Kiswahili: 52,
      Mathematics: 38,
      "Integrated Science": 49,
      "Social Studies": 55,
      "Pre-Technical Studies": 42,
      "Agriculture & Nutrition": 50,
      "Creative Arts & Sports": 48,
      "Religious Education": 53,
    },
  },
  {
    admissionNumber: "JSS/0410",
    fullName: "Esther Naliaka",
    gender: "Female",
    scores: {
      English: 73,
      Kiswahili: 80,
      Mathematics: 67,
      "Integrated Science": 75,
      "Social Studies": 71,
      "Pre-Technical Studies": 69,
      "Agriculture & Nutrition": 78,
      "Creative Arts & Sports": 82,
      "Religious Education": 74,
    },
  },
  {
    admissionNumber: "JSS/0369",
    fullName: "Felix Otieno",
    gender: "Male",
    scores: {
      English: 21,
      Kiswahili: 34,
      Mathematics: 18,
      "Integrated Science": 29,
      "Social Studies": 31,
      "Pre-Technical Studies": 24,
      "Agriculture & Nutrition": 38,
      "Creative Arts & Sports": 40,
      "Religious Education": 33,
    },
  },
  {
    admissionNumber: "JSS/0431",
    fullName: "Grace Chebet",
    gender: "Female",
    scores: {
      English: 88,
      Kiswahili: 76,
      Mathematics: 84,
      "Integrated Science": 79,
      "Social Studies": 82,
      "Pre-Technical Studies": 77,
      "Agriculture & Nutrition": 81,
      "Creative Arts & Sports": 85,
      "Religious Education": 80,
    },
  },
  {
    admissionNumber: "JSS/0396",
    fullName: "Hassan Abdullahi",
    gender: "Male",
    scores: {
      English: 60,
      Kiswahili: 58,
      Mathematics: 72,
      "Integrated Science": 64,
      "Social Studies": 57,
      "Pre-Technical Studies": 66,
      "Agriculture & Nutrition": 62,
      "Creative Arts & Sports": 59,
      "Religious Education": 61,
    },
  },
  {
    admissionNumber: "JSS/0447",
    fullName: "Irene Wambui",
    gender: "Female",
    scores: {
      English: 79,
      Kiswahili: 83,
      Mathematics: 70,
      "Integrated Science": 81,
      "Social Studies": 77,
      "Pre-Technical Studies": 75,
      "Agriculture & Nutrition": 84,
      "Creative Arts & Sports": 88,
      "Religious Education": 82,
    },
  },
  {
    admissionNumber: "JSS/0375",
    fullName: "John Kamau",
    gender: "Male",
    scores: {
      English: 54,
      Kiswahili: 49,
      Mathematics: 61,
      "Integrated Science": 47,
      "Social Studies": 52,
      "Pre-Technical Studies": 55,
      "Agriculture & Nutrition": 58,
      "Creative Arts & Sports": 50,
      "Religious Education": 46,
    },
  },
  {
    admissionNumber: "JSS/0418",
    fullName: "Lydia Akinyi",
    gender: "Female",
    scores: {
      English: 86,
      Kiswahili: 90,
      Mathematics: 78,
      "Integrated Science": 84,
      "Social Studies": 80,
      "Pre-Technical Studies": 82,
      "Agriculture & Nutrition": 87,
      "Creative Arts & Sports": 89,
      "Religious Education": 85,
    },
  },
  {
    admissionNumber: "JSS/0383",
    fullName: "Michael Barasa",
    gender: "Male",
    scores: {
      English: 33,
      Kiswahili: 41,
      Mathematics: 28,
      "Integrated Science": 36,
      "Social Studies": 44,
      "Pre-Technical Studies": 39,
      "Agriculture & Nutrition": 47,
      "Creative Arts & Sports": 45,
      "Religious Education": 42,
    },
  },
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
