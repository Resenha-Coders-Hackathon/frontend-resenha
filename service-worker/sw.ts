import { initializeApp } from 'firebase/app'
import { getMessaging } from 'firebase/messaging/sw'
import { clientsClaim, skipWaiting } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { firebaseConfig, firebaseConfigured } from '../src/firebaseConfig'

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision?: string | null }>
}

skipWaiting()
clientsClaim()
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// FCM displays notification payloads and handles fcm_options.link automatically.
if (firebaseConfigured) {
  getMessaging(initializeApp(firebaseConfig))
}
