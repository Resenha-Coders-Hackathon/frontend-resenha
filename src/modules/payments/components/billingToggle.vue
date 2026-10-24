<script setup lang="ts">
import type { BillingCycle } from '../types'
import { YEARLY_DISCOUNT } from '../utils/plans'

const cycle = defineModel<BillingCycle>({ required: true })

const OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' },
]
</script>

<template>
  <div
    role="radiogroup"
    aria-label="Ciclo de cobrança"
    class="inline-flex rounded-[12px] bg-(--bg-muted) p-[4px] dark:bg-black/40"
  >
    <label
      v-for="option in OPTIONS"
      :key="option.value"
      :class="[
        'flex cursor-pointer items-center gap-[6px] rounded-[9px] px-[14px] py-[6px] text-[13px] leading-normal font-medium transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2',
        cycle === option.value
          ? 'bg-(--surface) shadow-[0_1px_3px_rgb(0_0_0/0.1)] dark:bg-(--surface-inverse)'
          : 'text-(--text-secondary) hover:text-(--text-primary) dark:text-(--text-inverse-muted) dark:hover:text-(--text-inverse)',
      ]"
    >
      <input
        v-model="cycle"
        type="radio"
        name="billing-cycle"
        :value="option.value"
        class="sr-only"
      />
      {{ option.label }}
      <span v-if="option.value === 'yearly'" class="text-[11.5px] font-semibold text-[#1e9e5a]">
        −{{ YEARLY_DISCOUNT * 100 }}%
      </span>
    </label>
  </div>
</template>
