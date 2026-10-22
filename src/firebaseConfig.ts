function requireFirebaseEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Configure ${name} no arquivo .env.`)
  }

  return value
}

export const firebaseConfig = {
  apiKey: requireFirebaseEnv(import.meta.env.VITE_API_KEY, 'VITE_API_KEY'),
  authDomain: requireFirebaseEnv(import.meta.env.VITE_AUTH_DOMAIN, 'VITE_AUTH_DOMAIN'),
  projectId: requireFirebaseEnv(import.meta.env.VITE_PROJECT_ID, 'VITE_PROJECT_ID'),
  storageBucket: requireFirebaseEnv(import.meta.env.VITE_STORAGE_BUCKET, 'VITE_STORAGE_BUCKET'),
  messagingSenderId: requireFirebaseEnv(
    import.meta.env.VITE_MESSAGING_SENDER_ID,
    'VITE_MESSAGING_SENDER_ID',
  ),
  appId: requireFirebaseEnv(import.meta.env.VITE_APP_ID, 'VITE_APP_ID'),
  measurementId: requireFirebaseEnv(import.meta.env.VITE_MEASUREMENT_ID, 'VITE_MEASUREMENT_ID'),
}
