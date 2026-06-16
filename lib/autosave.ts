import type { Student, Grade } from "@/lib/results-data"

const STORAGE_KEY = "exam_results_autosave"
const AUTOSAVE_INTERVAL = 5000 // 5 seconds

export interface AutosaveData {
  gradeMap: Record<Grade, { students: Student[] }>
  selectedGrade: Grade
  lastSaved: number
}

export function saveToLocalStorage(data: AutosaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

export function loadFromLocalStorage(): AutosaveData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("Failed to load from localStorage:", error)
    return null
  }
}

export function clearAutosave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear autosave:", error)
  }
}

export function getAutosaveInterval(): number {
  return AUTOSAVE_INTERVAL
}
