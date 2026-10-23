<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton } from '@/shared/components'
import {
  PaymentCard,
  PaymentPage,
  PaymentStatusBadge,
  PaymentSteps,
  PaymentSummary,
  PixCode,
} from '../components'
import { usePaymentsStore } from '../stores'
import { isPaymentFinal } from '../utils'

const props = defineProps<{ id: string }>()

const router = useRouter()
const store = usePaymentsStore()
const isChecking = ref(false)
let pollingTimer: ReturnType<typeof setInterval> | undefined

const payment = computed(() => store.find(props.id))

const steps = [
  'Abra o app do seu banco e escolha pagar com Pix.',
  'Escaneie o QR Code ou cole o código copia e cola.',
  'Confirme o valor, finalize e clique em "Já paguei".',
]

async function refreshPayment(showError = false): Promise<void> {
  if (isChecking.value) return

  isChecking.value = true
  try {
    const updatedPayment = await store.load(props.id)
    if (updatedPayment && isPaymentFinal(updatedPayment.status)) {
      clearInterval(pollingTimer)
      router.push({ name: 'PaymentResult', params: { id: props.id } })
    }
  } catch (error) {
    if (showError) {
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível consultar o pagamento.',
      )
    }
  } finally {
    isChecking.value = false
  }
}

onMounted(async () => {
  if (!payment.value) await refreshPayment(true)
  pollingTimer = setInterval(() => refreshPayment(), 5000)
})

onBeforeUnmount(() => clearInterval(pollingTimer))
</script>

<template>
  <PaymentPage
    :crumbs="['Norte Studio', 'Pagamentos', 'Pix']"
    :title="payment ? 'Pague com Pix' : ''"
    description="Escaneie o QR Code ou use o código copia e cola no app do seu banco."
  >
    <template #top>
      <PaymentSteps :current="2" />
    </template>

    <div v-if="!payment" class="mx-auto w-full max-w-[520px]">
      <PaymentCard
        title="Pagamento indisponível"
        description="Os dados deste pagamento não estão mais disponíveis. Comece um novo."
      >
        <BaseButton
          label="Fazer novo pagamento"
          icon="arrow_forward"
          class="mt-0! h-[42px]! rounded-[10px]! py-0! text-[14px]!"
          @click="router.push({ name: 'Payment' })"
        />
      </PaymentCard>
    </div>

    <div v-else class="grid items-start gap-[20px] lg:grid-cols-[minmax(0,1fr)_360px]">
      <PaymentCard>
        <PaymentStatusBadge :status="payment.status" class="w-fit" />

        <div class="mx-auto w-full max-w-[420px]">
          <PixCode :qr-code="payment.qr_code" :qr-code-base64="payment.qr_code_base64" />
        </div>

        <ol
          class="grid gap-[14px] border-t border-(--border-default) pt-[16px] sm:grid-cols-3 dark:border-(--border-inverse)"
        >
          <li
            v-for="(step, index) in steps"
            :key="step"
            class="flex gap-[10px] text-[13px] leading-[19px]"
          >
            <span
              class="flex size-[22px] shrink-0 items-center justify-center rounded-full border border-(--border-default) text-[11px] font-semibold dark:border-(--border-inverse)"
            >
              {{ index + 1 }}
            </span>
            <span class="text-(--text-secondary) dark:text-(--text-inverse-muted)">{{ step }}</span>
          </li>
        </ol>
      </PaymentCard>

      <aside class="flex flex-col gap-[10px] lg:sticky lg:top-[24px]">
        <PaymentCard title="Resumo">
          <PaymentSummary
            :title="payment.title"
            :amount="payment.amount"
            :payer-name="payment.payer_name"
            :payer-cpf="payment.payer_cpf"
          />
          <BaseButton
            label="Já paguei"
            icon="check"
            icon-position="left"
            :loading="isChecking"
            class="mt-0! h-[44px]! rounded-[10px]! py-0! text-[14px]! [&_.material-symbols-outlined]:text-[17px]!"
            @click="refreshPayment(true)"
          />
        </PaymentCard>

        <BaseButton
          variant="ghost"
          label="Cancelar e voltar"
          icon="arrow_back"
          icon-position="left"
          class="mt-0! h-[40px]! rounded-[10px]! py-0! text-[13.5px]! [&_.material-symbols-outlined]:text-[17px]!"
          @click="router.push({ name: 'Payment' })"
        />
      </aside>
    </div>
  </PaymentPage>
</template>
