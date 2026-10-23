import type { Page } from '../types'

// Percorre todas as páginas de um endpoint paginado do DRF.
export async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<Page<T>>,
): Promise<T[]> {
  const items: T[] = []
  for (let page = 1; ; page++) {
    const response = await fetchPage(page)
    items.push(...response.results)
    if (!response.next) return items
  }
}
