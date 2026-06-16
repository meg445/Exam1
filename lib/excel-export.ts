import ExcelJS from "exceljs"
import {
  SUBJECTS,
  computeResults,
  subjectMean,
  subjectDistribution,
  type Student,
  type PerformanceLevel,
} from "@/lib/results-data"

const HEADER_FILL = "FF1F3A5F" // dark navy background for header row
const SUMMARY_FILL = "FFE8EEF5" // light tint for summary rows
const LEVEL_FILL = "FFF3D89B" // distribution rows tint

// Generate and trigger download of the compiled merit list workbook
export async function downloadMeritList(students: Student[]) {
  const results = computeResults(students)

  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Junior School Results Analysis System"
  workbook.created = new Date()

  const sheet = workbook.addWorksheet("Merit List", {
    views: [{ state: "frozen", ySplit: 1 }],
  })

  // ---- Column definitions ----
  const columns: Partial<ExcelJS.Column>[] = [
    { header: "Rank", key: "rank", width: 8 },
    { header: "Admission No.", key: "adm", width: 16 },
    { header: "Student Full Name", key: "name", width: 26 },
    { header: "Gender", key: "gender", width: 10 },
    ...SUBJECTS.map((subj) => ({ header: subj, key: subj, width: 14 })),
    { header: "Total Marks", key: "total", width: 13 },
    { header: "Mean Score", key: "mean", width: 12 },
    { header: "Performance Level", key: "level", width: 17 },
  ]
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
    for (const subj of SUBJECTS) rowData[subj] = r.scores[subj]

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

  const firstSubjectCol = 5 // column E (after Rank, Adm, Name, Gender)

  // ---- Subject Mean Score row ----
  const meanRow = sheet.addRow([])
  meanRow.getCell(1).value = "SUBJECT MEAN SCORE"
  sheet.mergeCells(meanRow.number, 1, meanRow.number, 4)
  SUBJECTS.forEach((subj, i) => {
    const cell = meanRow.getCell(firstSubjectCol + i)
    cell.value = Number(subjectMean(students, subj).toFixed(2))
    cell.numFmt = "0.00"
  })
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
    SUBJECTS.forEach((subj, i) => {
      const dist = subjectDistribution(students, subj)
      distRow.getCell(firstSubjectCol + i).value = dist[level]
    })
    styleSummaryRow(distRow, LEVEL_FILL, false)
  }

  // ---- Trigger browser download ----
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  const stamp = new Date().toISOString().slice(0, 10)
  a.download = `Compiled-Merit-List-${stamp}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
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
