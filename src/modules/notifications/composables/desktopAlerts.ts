const PREF_KEY = 'resenha.desktopAlerts'

const supported = () => typeof window !== 'undefined' && 'Notification' in window

/** Avisos do sistema operacional (API Notification do navegador); não dependem do Firebase. */
export function desktopAlertsOn(): boolean {
  if (!supported() || Notification.permission !== 'granted') return false
  try {
    return localStorage.getItem(PREF_KEY) !== 'off'
  } catch {
    return true
  }
}

export async function enableDesktopAlerts(): Promise<boolean> {
  if (!supported()) throw new Error('Este navegador não oferece suporte a notificações.')
  const permission =
    Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission
  if (permission !== 'granted') {
    throw new Error('A permissão para notificações foi negada. Libere nas configurações do site.')
  }
  try {
    localStorage.setItem(PREF_KEY, 'on')
  } catch {
    /* sem storage o aviso vale só nesta sessão */
  }
  return true
}

export function disableDesktopAlerts(): void {
  try {
    localStorage.setItem(PREF_KEY, 'off')
  } catch {
    /* ignore */
  }
}

/** True quando o usuário não está olhando para a aba (minimizada, outra aba ou outra janela). */
export const userAway = () => document.hidden || !document.hasFocus()

export function showDesktopAlert(options: {
  title: string
  body: string
  tag: string
  onClick?: () => void
}): void {
  if (!desktopAlertsOn()) return
  const alert = new Notification(options.title, {
    body: options.body,
    tag: options.tag, // a mesma conversa substitui o aviso anterior em vez de empilhar
    icon: '/icons/hackathon-192.png',
  })
  alert.onclick = () => {
    window.focus()
    options.onClick?.()
    alert.close()
  }
}
