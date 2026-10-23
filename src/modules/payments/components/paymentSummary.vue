<script setup lang="ts">
import { computed } from 'vue'
import type { PaymentMethod } from '../types'
import { formatCurrency, maskCpf } from '../utils'

interface Props {
  title: string
  amount: string
  payerName?: string
  payerCpf?: string
  method?: PaymentMethod
  // linhas extras (ex.: plano, ciclo, membros)
  details?: { label: string; value: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  payerName: '',
  payerCpf: '',
  method: 'pix',
  details: () => [],
})

const rows = computed(() =>
  [
    { label: 'Descrição', value: props.title || '—' },
    ...props.details,
    { label: 'Pagador', value: props.payerName },
    { label: 'CPF', value: props.payerCpf ? maskCpf(props.payerCpf) : '' },
    { label: 'Forma de pagamento', value: props.method === 'card' ? 'Cartão de crédito' : 'Pix' },
  ].filter((row) => row.value),
)
</script>

<template>
  <div>
    <dl class="flex flex-col gap-[10px] text-[13px] leading-normal">
      <div v-for="row in rows" :key="row.label" class="flex justify-between gap-[16px]">
        <dt class="text-(--text-secondary) dark:text-(--text-inverse-muted)">{{ row.label }}</dt>
        <dd class="min-w-0 text-right font-medium wrap-break-word">{{ row.value }}</dd>
      </div>
    </dl>

    <div
      class="mt-[16px] flex items-baseline justify-between border-t border-(--border-default) pt-[16px] dark:border-(--border-inverse)"
    >
      <span class="text-[13px] font-semibold">Total</span>
      <span class="text-[24px] leading-none font-semibold tracking-[-0.02em]">{{
        formatCurrency(amount)
      }}</span>
    </div>
  </div>
</template>
