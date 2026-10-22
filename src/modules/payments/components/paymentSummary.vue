<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency, maskCpf } from '../utils'

interface Props {
  title: string
  amount: string
  payerName?: string
  payerCpf?: string
}

const props = withDefaults(defineProps<Props>(), {
  payerName: '',
  payerCpf: '',
})

const rows = computed(() =>
  [
    { label: 'Descrição', value: props.title || '—' },
    { label: 'Pagador', value: props.payerName },
    { label: 'CPF', value: props.payerCpf ? maskCpf(props.payerCpf) : '' },
    { label: 'Forma de pagamento', value: 'Pix' },
  ].filter((row) => row.value),
)
</script>

<template>
  <div>
    <dl class="space-y-3 text-sm">
      <div v-for="row in rows" :key="row.label" class="flex justify-between gap-4">
        <dt class="text-(--text-secondary) dark:text-(--text-inverse-muted)">{{ row.label }}</dt>
        <dd class="min-w-0 text-right font-medium wrap-break-word">{{ row.value }}</dd>
      </div>
    </dl>

    <div
      class="mt-5 flex items-baseline justify-between border-t border-(--border-default) pt-5 dark:border-(--border-inverse)"
    >
      <span class="text-sm font-semibold">Total</span>
      <span class="text-2xl font-bold tracking-tight">{{ formatCurrency(amount) }}</span>
    </div>
  </div>
</template>
