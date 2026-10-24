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
      class="flex size-[220px] items-center justify-center rounded-[16px] border border-(--border-default) bg-(--surface) text-(--text-primary) dark:border-(--border-inverse) dark:bg-(--surface-inverse) dark:text-(--text-inverse)"
      role="img"
      aria-label="QR Code Pix para pagamento"
    >
      <img
        :src="`data:image/png;base64,${qrCodeBase64}`"
        alt="QR Code Pix para pagamento"
        class="h-full w-full rounded-[16px] object-contain"
      />
    </div>

    <div class="mt-[20px] flex w-full flex-col gap-[8px]">
      <p
        class="text-[12px] leading-normal font-semibold text-(--text-secondary) dark:text-(--text-inverse-muted)"
      >
        Pix copia e cola
      </p>
      <p
        class="rounded-[10px] border border-(--border-default) bg-(--bg-subtle) px-[12px] py-[10px] font-mono text-[12px] leading-5 text-(--text-secondary) dark:border-(--border-inverse) dark:bg-(--bg-subtle)/10 dark:text-(--text-inverse-muted)"
      >
        <span class="line-clamp-2 break-all select-all">{{ qrCode }}</span>
      </p>

      <BaseButton
        variant="secondary"
        :label="copied ? 'Código copiado' : 'Copiar código Pix'"
        :icon="copied ? 'check' : 'content_copy'"
        class="mt-[4px]! h-[42px]! rounded-[10px]! py-0! text-[14px]! [&_.material-symbols-outlined]:text-[17px]!"
        @click="copyCode"
      />
    </div>
  </div>
</template>
