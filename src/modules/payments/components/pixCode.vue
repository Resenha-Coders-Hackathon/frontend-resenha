<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { BaseButton } from '@/shared/components'

interface Props {
  qrCode: string
  qrCodeBase64: string
}

const props = defineProps<Props>()

const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

async function copyCode(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.qrCode)
    copied.value = true
    toast.success('Código Pix copiado.')
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => (copied.value = false), 2500)
  } catch {
    toast.error('Não foi possível copiar. Selecione o código e copie manualmente.')
  }
}
</script>

<template>
  <div class="flex flex-col items-center">
    <div
      class="flex h-60 w-60 items-center justify-center rounded-2xl border border-(--border-default) bg-(--surface) text-(--text-primary) dark:border-(--border-inverse)"
      role="img"
      aria-label="QR Code Pix para pagamento"
    >
      <img
        :src="`data:image/png;base64,${qrCodeBase64}`"
        alt="QR Code Pix para pagamento"
        class="h-full w-full rounded-2xl object-contain"
      />
    </div>

    <div class="mt-6 w-full">
      <p
        class="mb-2 text-xs font-semibold text-(--text-secondary) dark:text-(--text-inverse-muted)"
      >
        Pix copia e cola
      </p>
      <p
        class="rounded-2xl border border-(--border-default) bg-(--bg-subtle) px-5 py-3 font-mono text-xs leading-5 text-(--text-secondary) dark:border-(--border-inverse) dark:bg-(--bg-subtle)/10 dark:text-(--text-inverse-muted)"
      >
        <span class="line-clamp-2 break-all select-all">{{ qrCode }}</span>
      </p>

      <BaseButton
        variant="secondary"
        :label="copied ? 'Código copiado' : 'Copiar código Pix'"
        :icon="copied ? 'check' : 'content_copy'"
        @click="copyCode"
      />
    </div>
  </div>
</template>
