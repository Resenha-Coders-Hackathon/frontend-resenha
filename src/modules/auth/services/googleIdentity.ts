type GoogleButtonText = 'signin_with' | 'signup_with'

interface GoogleCredentialResponse {
  credential: string
}

interface GoogleIdentityClient {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string
        callback: (response: GoogleCredentialResponse) => void
      }) => void
      renderButton: (
        container: HTMLElement,
        options: {
          type: 'standard'
          theme: 'outline'
          size: 'large'
          text: GoogleButtonText
          shape: 'rectangular'
          logo_alignment: 'left'
          width: string
          locale: 'pt-BR'
        },
      ) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentityClient
  }
}

let scriptPromise: Promise<GoogleIdentityClient> | undefined
let initializedClientId: string | undefined
let activeCredentialHandler: ((credential: string) => void) | undefined

function loadGoogleIdentity(): Promise<GoogleIdentityClient> {
  if (window.google?.accounts.id) return Promise.resolve(window.google)
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<GoogleIdentityClient>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    const timeout = window.setTimeout(() => {
      script.remove()
      reject(
        new Error(
          'O login do Google demorou para carregar. Recarregue a página e tente novamente.',
        ),
      )
    }, 15_000)
    script.onload = () => {
      window.clearTimeout(timeout)
      if (window.google?.accounts.id) resolve(window.google)
      else reject(new Error('A biblioteca de login do Google não foi carregada.'))
    }
    script.onerror = () => {
      window.clearTimeout(timeout)
      script.remove()
      reject(new Error('Não foi possível carregar o login do Google.'))
    }
    document.head.append(script)
  }).catch((error: unknown) => {
    scriptPromise = undefined
    throw error
  })

  return scriptPromise
}

export async function mountGoogleButton(
  container: HTMLElement,
  clientId: string,
  text: GoogleButtonText,
  onCredential: (credential: string) => void,
  signal?: AbortSignal,
): Promise<() => void> {
  const google = await loadGoogleIdentity()
  if (signal?.aborted) return () => {}

  if (initializedClientId !== clientId) {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) activeCredentialHandler?.(response.credential)
      },
    })
    initializedClientId = clientId
  }

  let renderedWidth = 0
  const render = () => {
    // clientWidth excludes the invisible overlay's CSS scale; Google caps width at 400px.
    const width = Math.min(400, container.clientWidth)
    if (width <= 0 || width === renderedWidth) return

    container.replaceChildren()
    google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text,
      shape: 'rectangular',
      logo_alignment: 'left',
      width: String(width),
      locale: 'pt-BR',
    })
    renderedWidth = width
  }

  render()
  const resizeObserver = new ResizeObserver(render)
  resizeObserver.observe(container)

  const credentialHandler = (credential: string) => {
    if (!signal?.aborted) onCredential(credential)
  }
  activeCredentialHandler = credentialHandler

  const cleanup = () => {
    resizeObserver.disconnect()
    signal?.removeEventListener('abort', cleanup)
    if (activeCredentialHandler === credentialHandler) activeCredentialHandler = undefined
  }
  signal?.addEventListener('abort', cleanup, { once: true })
  return cleanup
}
