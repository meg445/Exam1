import { ResultsDashboard } from "@/components/results-dashboard"
import { SAMPLE_STUDENTS } from "@/lib/results-data"

export default function Page() {
  return <ResultsDashboard initialStudents={SAMPLE_STUDENTS} />
}
