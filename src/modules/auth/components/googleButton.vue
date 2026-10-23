<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { mountGoogleButton } from '../services/googleIdentity'

const props = withDefaults(defineProps<{ buttonText?: 'signin_with' | 'signup_with' }>(), {
  buttonText: 'signin_with',
})

const emit = defineEmits<{
  credential: [credential: string]
}>()

const buttonContainer = ref<HTMLDivElement>()
const label = computed(() =>
  props.buttonText === 'signup_with' ? 'Cadastrar com Google' : 'Entrar com Google',
)
const isLoading = ref(true)
const setupMessage = ref('')
const abortController = new AbortController()

function handleCredential(credential: string) {
  emit('credential', credential)
}

onMounted(async () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) {
    setupMessage.value = 'Configure VITE_GOOGLE_CLIENT_ID para habilitar esta opção.'
    isLoading.value = false
    return
  }

  try {
    if (buttonContainer.value) {
      await mountGoogleButton(
        buttonContainer.value,
        clientId,
        props.buttonText,
        handleCredential,
        abortController.signal,
      )
    }
  } catch (error) {
    setupMessage.value =
      error instanceof Error ? error.message : 'Não foi possível carregar o login do Google.'
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  abortController.abort()
})
</script>

<template>
  <div class="w-full">
    <!-- Visual próprio, igual aos outros botões; o botão oficial do Google fica
         invisível por cima, ampliado para cobrir a área toda, e recebe o clique. -->
    <div
      :class="[
        'google-button group relative flex h-13.5 w-full items-center justify-center gap-3 overflow-hidden rounded-lg border border-(--border-default) bg-(--surface) text-[16px] font-medium text-(--text-primary) transition-all duration-300 ease-out dark:border-(--border-inverse) dark:bg-(--surface-inverse) dark:text-(--text-inverse)',
        setupMessage || isLoading
          ? 'opacity-60'
          : 'hover:-translate-y-0.5 hover:border-(--border-strong) focus-within:border-(--border-strong) active:translate-y-0 active:scale-[0.98] dark:hover:border-(--text-inverse-muted)',
        isLoading ? 'animate-pulse' : '',
      ]"
    >
      <svg class="size-5 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
        />
      </svg>
      <span>{{ label }}</span>

      <div
        v-if="!setupMessage"
        ref="buttonContainer"
        class="google-button__overlay absolute inset-0 flex items-center justify-center"
      ></div>
    </div>

    <p v-if="setupMessage" class="mt-2 text-center text-[12px] leading-4.5 text-(--text-muted)">
      {{ setupMessage }}
    </p>
  </div>
</template>

<style scoped>
/* O iframe do Google tem no máximo 400px x 44px: ampliamos para cobrir o botão todo.
   Fica invisível, mas continua clicável e acessível por teclado. */
.google-button__overlay {
  opacity: 0;
  transform: scale(1.6);
}
</style>
