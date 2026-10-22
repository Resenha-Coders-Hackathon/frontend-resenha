<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const emit = defineEmits<{ credential: [value: string] }>()
const container = ref<HTMLDivElement | null>(null)
const error = ref('')
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
let disposed = false

type GoogleIdentity = {
  initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void
  renderButton: (element: HTMLElement, options: { theme: string; size: string; text: string }) => void
}
const googleWindow = window as Window & { google?: { accounts: { id: GoogleIdentity } } }

function render(): void {
  if (disposed || !container.value || !googleWindow.google) return
  const identity = googleWindow.google.accounts.id
  identity.initialize({
    client_id: clientId,
    callback: ({ credential }) => { if (!disposed) emit('credential', credential) },
  })
  identity.renderButton(container.value, { theme: 'outline', size: 'large', text: 'signin_with' })
}

onMounted(() => {
  if (!clientId) {
    error.value = 'Configure VITE_GOOGLE_CLIENT_ID para testar o login com Google.'
    return
  }
  if (googleWindow.google) {
    render()
    return
  }
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.onload = render
  script.onerror = () => { if (!disposed) error.value = 'Não foi possível carregar o botão do Google. Recarregue a página.' }
  document.head.appendChild(script)
})
onBeforeUnmount(() => { disposed = true })
</script>

<template>
  <div class="mt-5">
    <div ref="container" />
    <p v-if="error" role="alert" class="text-sm">{{ error }}</p>
  </div>
</template>
