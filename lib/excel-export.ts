import ExcelJS from "exceljs"
import {
  SUBJECTS,
  computeResults,
  subjectMean,
  subjectDistribution,
  createEmptyStudent,
  getPerformanceLevel,
  type Student,
  type Subject,
  type PerformanceLevel,
} from "@/lib/results-data"

const HEADER_FILL = "FF1F3A5F" // dark navy background for header row
const SUMMARY_FILL = "FFE8EEF5" // light tint for summary rows
const LEVEL_FILL = "FFF3D89B" // distribution rows tint

const TEMPLATE_SHEET = "Marks Entry"

// Trigger a browser download for an ExcelJS workbook
async function triggerDownload(workbook: ExcelJS.Workbook, fileName: string) {
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Generate a blank marks-entry template. Learner names/details are pre-filled
// (from the current roster, or blank starter rows) and subject columns are empty.
export async function downloadMarksTemplate(students: Student[]) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Junior School Results Analysis System"
  workbook.created = new Date()

  const sheet = workbook.addWorksheet(TEMPLATE_SHEET, {
    views: [{ state: "frozen", ySplit: 1 }],
  })

  sheet.columns = [
    { header: "Admission No.", key: "adm", width: 16 },
    { header: "Student Full Name", key: "name", width: 26 },
    { header: "Gender", key: "gender", width: 10 },
    ...SUBJECTS.map((subj) => ({ header: subj, key: subj, width: 14 })),
  ]

  // Header styling
  const headerRow = sheet.getRow(1)
  headerRow.height = 24
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } }
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
    cell.border = thinBorder()
  })

  // Pre-fill learner rows. If no roster yet, provide 10 blank rows.
  const roster = students.length ? students : Array.from({ length: 10 }, () => createEmptyStudent())
  for (const s of roster) {
    const rowData: Record<string, string | number> = {
      adm: s.admissionNumber,
      name: s.fullName,
      gender: s.gender || "Male",
    }
    // Leave subject cells blank so the teacher fills the scores
    const row = sheet.addRow(rowData)
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber > sheet.columnCount) return
      cell.border = thinBorder()
      cell.alignment = { vertical: "middle", horizontal: colNumber === 2 ? "left" : "center" }
    })
  }

  // Data-validation hint sheet
  const guide = workbook.addWorksheet("Instructions")
  guide.getColumn(1).width = 90
  const lines = [
    "How to use this template",
    "",
    "1. Keep the column headers in row 1 exactly as they are — do not rename or reorder them.",
    "2. Fill in Admission No., Student Full Name and Gender (Male/Female) for each learner.",
    "3. Enter each subject score as a number from 0 to 100. Leave blank or 0 if not assessed.",
    "4. Add as many learner rows as you need below the headers.",
    "5. Save the file, then use 'Upload Marks from Excel' on the dashboard to import.",
    "",
    "Performance levels are calculated automatically: EE 76-100, ME 51-75, AE 26-50, BE 0-25.",
  ]
  lines.forEach((text, i) => {
    const cell = guide.getCell(i + 1, 1)
    cell.value = text
    if (i === 0) cell.font = { bold: true, size: 13 }
  })

  await triggerDownload(workbook, "Marks-Entry-Template.xlsx")
}

// Normalise a header label for matching (lowercase, collapse spaces/punctuation)
function normalise(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]/g, "")
}

// Parse an uploaded marks workbook back into Student[].
export async function parseMarksWorkbook(file: File): Promise<Student[]> {
  const buffer = await file.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  const sheet = workbook.getWorksheet(TEMPLATE_SHEET) || workbook.worksheets[0]
  if (!sheet) throw new Error("No worksheet found in the uploaded file.")

  // Build a map of column index -> field from the header row
  const headerRow = sheet.getRow(1)
  const subjectByNorm = new Map<string, Subject>()
  SUBJECTS.forEach((s) => subjectByNorm.set(normalise(s), s))

  const colMap: { col: number; field: "adm" | "name" | "gender" | Subject }[] = []
  headerRow.eachCell((cell, col) => {
    const norm = normalise(String(cell.value ?? ""))
    if (!norm) return
    if (norm.includes("admission") || norm === "adm" || norm === "admno") {
      colMap.push({ col, field: "adm" })
    } else if (norm.includes("name")) {
      colMap.push({ col, field: "name" })
    } else if (norm.includes("gender") || norm.includes("sex")) {
      colMap.push({ col, field: "gender" })
    } else if (subjectByNorm.has(norm)) {
      colMap.push({ col, field: subjectByNorm.get(norm)! })
    }
  })

  if (!colMap.some((c) => c.field === "name")) {
    throw new Error("Could not find a 'Student Full Name' column. Use the provided template.")
  }

  const students: Student[] = []
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // skip header

    const student = createEmptyStudent()
    let hasData = false

    for (const { col, field } of colMap) {
      const raw = row.getCell(col).value
      if (field === "adm") {
        const v = String(raw ?? "").trim()
        student.admissionNumber = v
        if (v) hasData = true
      } else if (field === "name") {
        const v = String(raw ?? "").trim()
        student.fullName = v
        if (v) hasData = true
      } else if (field === "gender") {
        const v = normalise(String(raw ?? ""))
        student.gender = v.startsWith("f") ? "Female" : "Male"
      } else {
        // subject score
        const num = typeof raw === "number" ? raw : Number(String(raw ?? "").trim())
        const score = Number.isFinite(num) ? Math.min(100, Math.max(0, Math.round(num))) : 0
        student.scores[field] = score
        if (score) hasData = true
      }
    }

    if (hasData) students.push(student)
  })

  if (students.length === 0) {
    throw new Error("No learner rows with data were found in the file.")
  }

  return students
}

// Generate and trigger download of the compiled merit list workbook with Score/Level pairs
export async function downloadMeritList(students: Student[]) {
  const results = computeResults(students)

  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Junior School Results Analysis System"
  workbook.created = new Date()

  const sheet = workbook.addWorksheet("Merit List", {
    views: [{ state: "frozen", ySplit: 1 }],
  })

  // ---- Column definitions with Score/Level pairs for each subject ----
  const columns: Partial<ExcelJS.Column>[] = [
    { header: "Rank", key: "rank", width: 8 },
    { header: "Admission No.", key: "adm", width: 16 },
    { header: "Student Full Name", key: "name", width: 26 },
    { header: "Gender", key: "gender", width: 10 },
  ]

  // Add Score and Level columns for each subject
  for (const subj of SUBJECTS) {
    columns.push({ header: `${subj} (Score)`, key: `${subj}_score`, width: 12 })
    columns.push({ header: `${subj} (Level)`, key: `${subj}_level`, width: 12 })
  }

  columns.push(
    { header: "Total Marks", key: "total", width: 13 },
    { header: "Mean Score", key: "mean", width: 12 },
    { header: "Performance Level", key: "level", width: 17 },
  )

  sheet.columns = columns

  // ---- Header row styling ----
  const headerRow = sheet.getRow(1)
  headerRow.height = 24
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } }
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
    cell.border = thinBorder()
  })

  // ---- Student rows ----
  for (const r of results) {
    const rowData: Record<string, string | number> = {
      rank: r.rank,
      adm: r.admissionNumber,
      name: r.fullName,
      gender: r.gender,
      total: r.total,
      mean: Number(r.mean.toFixed(2)),
      level: r.level,
    }

    // Add score and level for each subject
    for (const subj of SUBJECTS) {
      const score = r.scores[subj]
      const level = getPerformanceLevel(score)
      rowData[`${subj}_score`] = score
      rowData[`${subj}_level`] = level
    }

    const row = sheet.addRow(rowData)
    row.eachCell((cell, colNumber) => {
      cell.border = thinBorder()
      // center everything except the name column (col 3)
      cell.alignment = {
        vertical: "middle",
        horizontal: colNumber === 3 ? "left" : "center",
      }
    })
    row.getCell("mean").numFmt = "0.00"
  }

  // ---- Spacer row ----
  sheet.addRow([])

  // Calculate first subject score column (after Rank, Adm, Name, Gender = columns 1-4)
  const firstSubjectCol = 5

  // ---- Subject Mean Score row ----
  const meanRow = sheet.addRow([])
  meanRow.getCell(1).value = "SUBJECT MEAN SCORE"
  sheet.mergeCells(meanRow.number, 1, meanRow.number, 4)

  // Add subject means and their performance levels
  for (let i = 0; i < SUBJECTS.length; i++) {
    const subj = SUBJECTS[i]
    const scoreCol = firstSubjectCol + i * 2
    const levelCol = scoreCol + 1

    const mean = subjectMean(students, subj)
    const level = getPerformanceLevel(mean)

    const cell = meanRow.getCell(scoreCol)
    cell.value = Number(mean.toFixed(2))
    cell.numFmt = "0.00"

    const levelCell = meanRow.getCell(levelCol)
    levelCell.value = level
  }

  // overall class mean in the Mean column
  const classMean =
    results.reduce((acc, r) => acc + r.mean, 0) / (results.length || 1)
  meanRow.getCell("mean").value = Number(classMean.toFixed(2))
  meanRow.getCell("mean").numFmt = "0.00"
  styleSummaryRow(meanRow, SUMMARY_FILL, true)

  // ---- Subject Grade Distribution rows (one per level) ----
  const levels: PerformanceLevel[] = ["EE", "ME", "AE", "BE"]
  for (const level of levels) {
    const distRow = sheet.addRow([])
    distRow.getCell(1).value = `No. of ${level}`
    sheet.mergeCells(distRow.number, 1, distRow.number, 4)

    for (let i = 0; i < SUBJECTS.length; i++) {
      const subj = SUBJECTS[i]
      const dist = subjectDistribution(students, subj)
      const scoreCol = firstSubjectCol + i * 2
      const levelCol = scoreCol + 1

      const cell = distRow.getCell(scoreCol)
      cell.value = dist[level]

      const levelCell = distRow.getCell(levelCol)
      levelCell.value = "—"
    }

    styleSummaryRow(distRow, LEVEL_FILL, false)
  }

  // ---- Trigger browser download ----
  const stamp = new Date().toISOString().slice(0, 10)
  await triggerDownload(workbook, `Compiled-Merit-List-${stamp}.xlsx`)
}

function thinBorder(): Partial<ExcelJS.Borders> {
  const side = { style: "thin" as const, color: { argb: "FFB8C2CC" } }
  return { top: side, left: side, bottom: side, right: side }
}

function styleSummaryRow(row: ExcelJS.Row, fill: string, bold: boolean) {
  row.height = 20
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber > row.worksheet.columnCount) return
    cell.font = { bold: bold || colNumber === 1, size: 11 }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } }
    cell.alignment = {
      vertical: "middle",
      horizontal: colNumber === 1 ? "left" : "center",
    }
    cell.border = thinBorder()
  })
}
