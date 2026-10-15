import { getToken, onMessage, type MessagePayload } from 'firebase/messaging'
import { getFirebaseMessaging } from '@/firebase'

export async function requestDeviceFcmToken(): Promise<{
  token: string
  messaging: Awaited<ReturnType<typeof getFirebaseMessaging>>
}> {
  if (!('Notification' in window)) {
    throw new Error('Este navegador não oferece suporte a notificações.')
  }

  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    throw new Error('Notificações push exigem HTTPS (ou localhost) e suporte a service workers.')
  }

  if (!import.meta.env.VITE_VAPID_KEY) {
    throw new Error('Configure VITE_VAPID_KEY com a chave Web Push do Firebase.')
  }

  let permission = Notification.permission
  if (permission === 'default') {
    permission = await Notification.requestPermission()
  }

  if (permission !== 'granted') {
    throw new Error('A permissão para notificações não foi concedida.')
  }

  const messaging = await getFirebaseMessaging()
  const serviceWorkerRegistration = await navigator.serviceWorker.ready
  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_VAPID_KEY,
    serviceWorkerRegistration,
  })

  if (!token) {
    throw new Error('O Firebase não retornou um token para este dispositivo.')
  }

  return { token, messaging }
}

export function listenForForegroundMessages(
  messaging: Awaited<ReturnType<typeof getFirebaseMessaging>>,
  onNotification: (payload: MessagePayload) => void,
): () => void {
  return onMessage(messaging, onNotification)
}