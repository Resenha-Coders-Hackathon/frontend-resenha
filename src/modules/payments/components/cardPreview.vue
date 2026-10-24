<script setup lang="ts">
import { computed } from 'vue'
import type { CardBrand } from '../types'
import { CARD_BRAND_LABELS } from '../utils'

const props = defineProps<{ number: string; holder: string; expiry: string; brand: CardBrand }>()

// mostra o número digitado e completa o resto com pontos
const masked = computed(() => {
  const template = props.brand === 'amex' ? '•••• •••••• •••••' : '•••• •••• •••• ••••'
  return template
    .split('')
    .map((char, index) => props.number[index] ?? char)
    .join('')
})
</script>

<template>
  <div
    class="relative flex aspect-[1.586] w-full max-w-[340px] flex-col justify-between overflow-hidden rounded-[16px] bg-linear-to-br from-[#2a2925] via-[#191917] to-[#0e0e0d] p-[18px] text-white shadow-[0_18px_40px_-20px_rgb(0_0_0/0.6)]"
    aria-hidden="true"
  >
    <span class="absolute -top-[40%] -right-[25%] size-[80%] rounded-full bg-white/6"></span>
    <div class="relative flex items-center justify-between">
      <span
        class="h-[26px] w-[36px] rounded-[6px] bg-linear-to-br from-[#e8d9a8] to-[#b8a36b]"
      ></span>
      <span class="text-[14px] font-semibold tracking-wide italic">{{
        CARD_BRAND_LABELS[brand]
      }}</span>
    </div>
    <p class="relative font-mono text-[17px] tracking-[0.12em]">{{ masked }}</p>
    <div
      class="relative flex items-end justify-between gap-[12px] text-[11px] leading-normal uppercase"
    >
      <span class="flex min-w-0 flex-col">
        <span class="text-white/50">Titular</span>
        <span class="truncate text-[13px] tracking-wide">{{ holder || 'Nome no cartão' }}</span>
      </span>
      <span class="flex shrink-0 flex-col text-right">
        <span class="text-white/50">Validade</span>
        <span class="font-mono text-[13px]">{{ expiry || 'MM/AA' }}</span>
      </span>
    </div>
  </div>
</template>
