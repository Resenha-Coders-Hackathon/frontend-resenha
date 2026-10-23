<script setup lang="ts">
import type { PaymentMethod } from '../types'

const method = defineModel<PaymentMethod>({ required: true })

const METHODS: { value: PaymentMethod; label: string; icon: string; note: string }[] = [
  { value: 'card', label: 'Cartão de crédito', icon: 'credit_card', note: 'Aprovação na hora' },
  { value: 'pix', label: 'Pix', icon: 'qr_code_2', note: 'QR Code ou copia e cola' },
]
</script>

<template>
  <fieldset class="grid gap-[10px] sm:grid-cols-2">
    <legend class="sr-only">Forma de pagamento</legend>
    <label
      v-for="item in METHODS"
      :key="item.value"
      :class="[
        'flex cursor-pointer items-center gap-[12px] rounded-[12px] border p-[12px] transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2',
        method === item.value
          ? 'border-(--border-strong) bg-(--surface) dark:border-(--text-inverse-muted) dark:bg-white/5'
          : 'border-(--border-default) hover:border-(--text-muted) dark:border-(--border-inverse)',
      ]"
    >
      <input
        v-model="method"
        type="radio"
        name="payment-method"
        :value="item.value"
        class="sr-only"
      />
      <span
        class="grid size-[36px] shrink-0 place-items-center rounded-[10px] bg-(--bg-subtle) dark:bg-black/30"
        aria-hidden="true"
      >
        <span class="material-symbols-outlined text-[20px]!">{{ item.icon }}</span>
      </span>
      <span class="flex min-w-0 flex-1 flex-col leading-normal">
        <span class="text-[14px] font-medium">{{ item.label }}</span>
        <span class="text-[12px] text-(--text-muted)">{{ item.note }}</span>
      </span>
      <span
        :class="[
          'grid size-[18px] shrink-0 place-items-center rounded-full border-2',
          method === item.value
            ? 'border-(--text-primary) dark:border-(--text-inverse)'
            : 'border-(--border-default) dark:border-(--border-inverse)',
        ]"
        aria-hidden="true"
      >
        <span
          v-if="method === item.value"
          class="size-[8px] rounded-full bg-(--text-primary) dark:bg-(--text-inverse)"
        ></span>
      </span>
    </label>
  </fieldset>
</template>
