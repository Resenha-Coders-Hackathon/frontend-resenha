import { connectGoogle, getGoogleAuthorizeUrl, getGoogleStatus } from '../services'

const PENDING_KEY = 'resenha.googleConnectPending'

/**
 * True when Google is already connected (with Drive, if asked); otherwise sends the browser to
 * Google's consent page and returns false. `returnTo` is where finishGoogleConnect sends the user back.
 */
export async function ensureGoogleConnected(
  options: { drive?: boolean; returnTo?: string } = {},
): Promise<boolean> {
  const status = await getGoogleStatus()
  if (status.connected && (!options.drive || status.drive)) return true
  const url = await getGoogleAuthorizeUrl(options.drive)
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ returnTo: options.returnTo ?? '/' }))
  } catch {
    /* Without storage the user just repeats the action after connecting. */
  }
  window.location.assign(url)
  return false
}

/**
 * Google sends the user back with ?code&state. Finishes the connection when the redirect started
 * from this app and returns the route to go back to (null when there is nothing to finish).
 */
export async function finishGoogleConnect(): Promise<string | null> {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')
  let returnTo: string | null = null
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    returnTo = raw ? (JSON.parse(raw) as { returnTo?: string }).returnTo || '/' : null
    sessionStorage.removeItem(PENDING_KEY)
  } catch {
    /* storage unavailable or corrupted: treat as nothing pending */
  }
  if (returnTo === null || !code || !state) return null
  await connectGoogle(code, state)
  return returnTo
}
