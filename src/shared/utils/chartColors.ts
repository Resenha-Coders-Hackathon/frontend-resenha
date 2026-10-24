const ACCENT = '#ff6700'
const CATEGORY = ['#ef5418', '#6a4cf5', '#2563eb', '#15924a', '#c9720a', '#0e9488']

/** Série cronológica: tinta nas barras antigas e o laranja da marca na mais recente. */
export function inkWithAccent(count: number, dark: boolean): string[] {
  const ink = dark ? '#edece8' : '#141412'
  return Array.from({ length: count }, (_, i) => (i === count - 1 ? ACCENT : ink))
}

/** Uma cor por categoria (setor, pessoa), em ciclo. */
export function categoryColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => CATEGORY[i % CATEGORY.length]!)
}
