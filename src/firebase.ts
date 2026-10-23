import { initializeApp } from 'firebase/app'
import { getMessaging, isSupported } from 'firebase/messaging'
import { firebaseConfig, firebaseConfigured } from './firebaseConfig'

export async function getFirebaseMessaging() {
  if (!firebaseConfigured) {
    throw new Error('Configure as variáveis públicas do Firebase para ativar o push.')
  }
  if (!(await isSupported())) {
    throw new Error('Este navegador não oferece suporte ao Firebase Cloud Messaging.')
  }

  return getMessaging(initializeApp(firebaseConfig))
}
