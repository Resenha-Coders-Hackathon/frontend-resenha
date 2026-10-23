<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { mountGoogleButton } from '../services/googleIdentity'

const props = withDefaults(defineProps<{ buttonText?: 'signin_with' | 'signup_with' }>(), {
  buttonText: 'signin_with',
})

const emit = defineEmits<{
  credential: [credential: string]
}>()

const buttonContainer = ref<HTMLDivElement>()
const isLoading = ref(true)
const setupMessage = ref('')
let unmountGoogleButton: (() => void) | undefined
let isDisposed = false

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
      const cleanup = await mountGoogleButton(
        buttonContainer.value,
        clientId,
        props.buttonText,
        handleCredential,
      )
      if (isDisposed) cleanup()
      else unmountGoogleButton = cleanup
    }
  } catch (error) {
    setupMessage.value =
      error instanceof Error ? error.message : 'Não foi possível carregar o login do Google.'
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  isDisposed = true
  unmountGoogleButton?.()
})
</script>

<template>
  <div class="w-full">
    <div v-if="setupMessage" class="w-full">
      <button
        type="button"
        disabled
        class="h-11 w-full rounded-sm border border-(--border-default) bg-(--surface) text-[14px] font-medium text-(--text-secondary) opacity-60 dark:border-(--border-inverse) dark:bg-(--surface-inverse) dark:text-(--text-inverse-muted)"
      >
        {{ props.buttonText === 'signup_with' ? 'Cadastrar com Google' : 'Entrar com Google' }}
      </button>
      <p class="mt-2 text-center text-[12px] leading-4.5 text-(--text-muted)">
        {{ setupMessage }}
      </p>
    </div>

    <div v-else class="w-full">
      <div
        v-if="isLoading"
        class="h-11 w-full animate-pulse rounded-sm border border-(--border-default) bg-(--bg-subtle) dark:border-(--border-inverse) dark:bg-black/20"
        aria-hidden="true"
      ></div>
      <div
        ref="buttonContainer"
        :class="['flex w-full justify-center', isLoading ? 'hidden' : '']"
      ></div>
    </div>
  </div>
</template>
