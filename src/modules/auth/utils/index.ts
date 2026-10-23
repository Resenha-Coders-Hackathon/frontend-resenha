// Parse against a fixed origin so this also works in tests and rejects external destinations.
export function safeRedirect(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || /[\\\s]/.test(value)) return '/'
  try {
    const url = new URL(value, 'https://app.invalid')
    const path = decodeURIComponent(url.pathname)
    if (url.origin !== 'https://app.invalid' || path.startsWith('//') || /[\\\s]/.test(path)) {
      return '/'
    }
    return url.pathname + url.search + url.hash
  } catch {
    return '/'
  }
}
