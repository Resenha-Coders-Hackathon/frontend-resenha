<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
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
    ? 'Consultando pagamento'
    : approved.value
      ? 'Pagamento confirmado'
      : isPaymentFinal(payment.value.status)
        ? 'Pagamento não concluído'
        : 'Aguardando confirmação',
)
const message = computed(() => {
  if (!payment.value) return 'Consultando os dados no servidor.'
  if (approved.value) return 'Pagamento aprovado. Seu acesso à IA está liberado.'
  if (!isPaymentFinal(payment.value.status))
    return 'Aguarde a confirmação do pagamento pelo Mercado Pago.'
  return 'Este pagamento não liberou o acesso à IA. Consulte o status abaixo.'
})

let timer: ReturnType<typeof setTimeout> | undefined
let disposed = false
let checking = false
async function refresh() {
  if (checking || disposed) return
  checking = true
  clearTimeout(timer)
  try {
    await store.load(props.id)
    if (disposed) return
    if (payment.value && !isPaymentFinal(payment.value.status)) {
      if (method.value === 'pix') {
        await router.replace({ name: 'PaymentPix', params: { id: props.id } })
      } else timer = setTimeout(refresh, 5000)
    }
  } catch (error) {
    if (!disposed)
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível consultar o pagamento.',
      )
  } finally {
    checking = false
  }
}
onMounted(refresh)
onBeforeUnmount(() => {
  disposed = true
  clearTimeout(timer)
})
</script>

<template>
  <PaymentPage
    :crumbs="['Pagamentos', 'Confirmação']"
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
          :label="
            approved
              ? 'Abrir assistente'
              : isPaymentFinal(payment.status)
                ? 'Tentar novamente'
                : 'Consultar novamente'
          "
          :icon="approved ? 'workspace_premium' : 'refresh'"
          icon-position="left"
          class="mt-0! h-[44px]! rounded-[10px]! py-0! text-[14px]! [&_.material-symbols-outlined]:text-[17px]!"
          @click="
            approved
              ? router.push({ name: 'Assistant' })
              : isPaymentFinal(payment.status)
                ? router.push({ name: 'Payment' })
                : refresh()
          "
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
