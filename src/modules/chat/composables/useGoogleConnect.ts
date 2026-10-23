import { googleAuthorizeUrl, googleConnect, googleConnected } from '../services'

const PENDING_KEY = 'resenha.googleMeetPending'

/** True when Google is already connected; otherwise sends the browser to Google's consent page. */
export async function ensureGoogleConnected(): Promise<boolean> {
  if (await googleConnected()) return true
  const url = await googleAuthorizeUrl()
  try {
    sessionStorage.setItem(PENDING_KEY, '1')
  } catch {
    /* Without storage the user just starts the Meet again after connecting. */
  }
  window.location.assign(url)
  return false
}

/**
 * Google sends the user back with ?code&state. Finishes the connection when the redirect
 * started from the chat; returns true so the caller can take the user back to /chat.
 */
export async function finishGoogleConnect(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')
  let pending: string | null = null
  try {
    pending = sessionStorage.getItem(PENDING_KEY)
  } catch {
    /* storage unavailable */
  }
  if (!pending || !code || !state) return false
  try {
    sessionStorage.removeItem(PENDING_KEY)
  } catch {
    /* storage unavailable */
  }
  await googleConnect(code, state)
  return true
}
