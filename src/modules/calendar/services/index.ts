import { api } from '@/app/plugins/axios'
import type { ISODate } from '@/shared/types'
import type { CalendarItem } from '../types'

export async function listCalendar(
  organizationId: string,
  start: ISODate,
  end: ISODate,
): Promise<CalendarItem[]> {
  const response = await api.get<CalendarItem[]>(
    `/organizations/${encodeURIComponent(organizationId)}/calendar/`,
    { params: { start, end } },
  )
  return response.data
}
