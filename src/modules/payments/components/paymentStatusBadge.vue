<script setup lang="ts">
import { computed } from 'vue'
import type { PaymentStatus } from '../types'
import { isPaymentApproved, isPaymentFinal, PAYMENT_STATUS_LABELS } from '../utils'

interface Props {
  status: PaymentStatus
}

const props = defineProps<Props>()

const isWaiting = computed(() => !isPaymentFinal(props.status))

const badgeClasses = computed(() => {
  if (isPaymentApproved(props.status)) return 'bg-(--sucess)/10 text-(--sucess)'
  if (isWaiting.value) {
    return 'bg-(--bg-subtle) text-(--text-primary) dark:bg-(--bg-subtle)/10 dark:text-(--text-inverse)'
  }
  return 'bg-(--destructive)/10 text-(--destructive)'
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
      badgeClasses,
    ]"
  >
    <span class="relative flex h-2 w-2">
      <span
        v-if="isWaiting"
        class="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60"
      />
      <span class="relative inline-flex h-2 w-2 rounded-full bg-current" />
    </span>
    {{ PAYMENT_STATUS_LABELS[status] }}
  </span>
</template>
