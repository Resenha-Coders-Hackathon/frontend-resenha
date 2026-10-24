import { api } from '@/app/plugins/axios'
import type { Report, ReportDays } from '../types'

export async function getReport(organizationId: string, days: ReportDays): Promise<Report> {
  const path = `/organizations/${encodeURIComponent(organizationId)}/reports/`
  return (await api.get<Report>(path, { params: { days } })).data
}
