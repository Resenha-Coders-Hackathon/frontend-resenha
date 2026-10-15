import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getMessaging, isSupported } from 'firebase/messaging'
import { firebaseConfig } from './firebaseConfig'

export const app = initializeApp(firebaseConfig)
export const analytics = getAnalytics(app)

export async function getFirebaseMessaging() {
  if (!(await isSupported())) {
    throw new Error('Este navegador não oferece suporte ao Firebase Cloud Messaging.')
  }

  return getMessaging(app)
}
