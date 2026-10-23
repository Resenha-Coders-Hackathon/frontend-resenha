import { api, getErrorMessage } from '@/app/plugins/axios'
import type { UUID } from '@/shared/types'
import type { SearchResult } from '../types'

export const SEARCH_MIN_LENGTH = 2 // o backend exige 2+ caracteres

export async function searchOrganization(organizationId: UUID, q: string): Promise<SearchResult> {
  try {
    return (
      await api.get<SearchResult>(`/organizations/${encodeURIComponent(organizationId)}/search/`, {
        params: { q },
      })
    ).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível buscar.'))
  }
}
