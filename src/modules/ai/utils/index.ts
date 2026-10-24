/** DRF field errors and tool failures can contain nested lists and dictionaries. */
export function aiErrorDetails(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(aiErrorDetails).filter(Boolean).join(' ')
  if (value && typeof value === 'object') {
    if ('detail' in value) {
      const file = 'file' in value && typeof value.file === 'string' ? value.file : ''
      const reason = 'reason' in value ? aiErrorDetails(value.reason) : ''
      return [file, aiErrorDetails(value.detail), reason].filter(Boolean).join(': ')
    }
    return Object.entries(value)
      .filter(([key]) => key !== 'index')
      .map(([, item]) => aiErrorDetails(item))
      .filter(Boolean)
      .join(' ')
  }
  return ''
}
