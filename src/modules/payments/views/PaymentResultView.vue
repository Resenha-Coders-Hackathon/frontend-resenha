<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton } from '@/shared/components'
import {
  PaymentCard,
  PaymentPage,
  PaymentStatusBadge,
  PaymentSteps,
  PaymentSummary,
} from '../components'
import { usePaymentsStore } from '../stores'
import { isPaymentApproved, isPaymentFinal } from '../utils'

const props = defineProps<{ id: string }>()

const router = useRouter()
const store = usePaymentsStore()

const payment = computed(() => store.find(props.id))
const approved = computed(() => !!payment.value && isPaymentApproved(payment.value.status))
const method = computed(() => store.methodOf(props.id))

const heading = computed(() =>
  !payment.value
    ? 'Pagamento indisponível'
    : approved.value
      ? 'Pagamento confirmado'
      : 'Pagamento não concluído',
)
const message = computed(() => {
  if (!payment.value) return 'Os dados deste pagamento não estão mais disponíveis. Comece um novo.'
  if (!approved.value)
    return 'O pagamento não foi aprovado. Nenhum valor foi cobrado; tente de novo.'
  return method.value === 'card'
    ? 'Cartão aprovado. Esta é uma demonstração: nenhum valor foi cobrado de verdade.'
    : 'Recebemos a confirmação do seu Pix. Está tudo certo.'
})

// ainda não pago: volta para a tela do QR Code
onMounted(async () => {
  if (!payment.value && method.value === 'pix') {
    try {
      await store.load(props.id)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível consultar o pagamento.',
      )
    }
  }

  if (payment.value && !isPaymentFinal(payment.value.status)) {
    router.replace({ name: 'PaymentPix', params: { id: props.id } })
  }
})
</script>

<template>
  <PaymentPage
    :crumbs="['Norte Studio', 'Pagamentos', 'Confirmação']"
    :title="heading"
    :description="message"
  >
    <template #top>
      <PaymentSteps :current="3" :completed="approved" />
    </template>

    <div class="mx-auto w-full max-w-[520px]">
      <PaymentCard v-if="!payment">
        <BaseButton
          label="Fazer novo pagamento"
          class="mt-0! h-[44px]! rounded-[10px]! py-0! text-[14px]! [&_.material-symbols-outlined]:text-[17px]!"
          @click="router.push({ name: 'Payment' })"
        />
      </PaymentCard>

      <PaymentCard v-else>
        <div class="flex flex-col items-center gap-[12px] pt-[6px] text-center">
          <span
            :class="[
              'flex size-[56px] items-center justify-center rounded-full',
              approved
                ? 'bg-[#e4f4ea] text-[#127a3e] dark:bg-[#127a3e]/25 dark:text-[#7ed9a2]'
                : 'bg-(--destructive)/10 text-(--destructive)',
            ]"
          >
            <span class="material-symbols-outlined text-[28px]!" aria-hidden="true">
              {{ approved ? 'check' : 'close' }}
            </span>
          </span>
          <PaymentStatusBadge :status="payment.status" />
        </div>

        <div class="border-t border-(--border-default) pt-[16px] dark:border-(--border-inverse)">
          <PaymentSummary
            :title="payment.title"
            :amount="payment.amount"
            :payer-name="payment.payer_name"
            :payer-cpf="payment.payer_cpf"
            :method="method"
          />
        </div>

        <BaseButton
          :label="approved ? 'Ver planos' : 'Tentar novamente'"
          :icon="approved ? 'workspace_premium' : 'refresh'"
          icon-position="left"
          class="mt-0! h-[44px]! rounded-[10px]! py-0! text-[14px]! [&_.material-symbols-outlined]:text-[17px]!"
          @click="router.push({ name: approved ? 'Plans' : 'Payment' })"
        />
        <BaseButton
          variant="ghost"
          label="Voltar ao início"
          icon="home"
          icon-position="left"
          class="mt-0! h-[40px]! rounded-[10px]! py-0! text-[13.5px]! [&_.material-symbols-outlined]:text-[17px]!"
          @click="router.push({ name: 'Home' })"
        />
      </PaymentCard>
    </div>
  </PaymentPage>
</template>
