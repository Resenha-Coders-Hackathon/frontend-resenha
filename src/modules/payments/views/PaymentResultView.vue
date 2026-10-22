<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton } from '@/shared/components'
import { PaymentCard, PaymentStatusBadge, PaymentSteps, PaymentSummary } from '../components'
import { usePaymentsStore } from '../stores'
import { isPaymentApproved, isPaymentFinal } from '../utils'

const props = defineProps<{ id: string }>()

const router = useRouter()
const store = usePaymentsStore()

const payment = computed(() => store.find(props.id))
const approved = computed(() => !!payment.value && isPaymentApproved(payment.value.status))

// ainda não pago: volta para a tela do QR Code
onMounted(() => {
  if (payment.value && !isPaymentFinal(payment.value.status)) {
    router.replace({ name: 'PaymentPix', params: { id: props.id } })
  }
})
</script>

<template>
  <section
    class="mx-auto flex min-h-[calc(100svh_-_60px)] w-full max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 md:px-12 xl:px-20"
  >
    <PaymentSteps :current="3" :completed="approved" />

    <div class="mt-10">
      <h2>{{ !payment ? 'Pagamento indisponível' : approved ? 'Pagamento confirmado' : 'Pagamento não concluído' }}</h2>
      <p class="mt-3 max-w-2xl text-sm text-(--text-secondary) dark:text-(--text-inverse-muted)">
        {{
          !payment
            ? 'Os dados deste pagamento não estão mais disponíveis. Comece um novo.'
            : approved
              ? 'Recebemos a confirmação do seu Pix. Está tudo certo.'
              : 'O Pix não foi aprovado. Nenhum valor foi cobrado; gere um novo QR Code para tentar de novo.'
        }}
      </p>
    </div>

    <div class="mx-auto mt-8 w-full max-w-xl">
      <PaymentCard
        v-if="!payment"
        title="Pagamento indisponível"
        description="Os dados deste pagamento não estão mais disponíveis. Comece um novo."
      >
        <BaseButton label="Fazer novo pagamento" @click="router.push({ name: 'Payment' })" />
      </PaymentCard>

      <PaymentCard v-else>
        <div class="flex flex-col items-center text-center">
          <span
            :class="[
              'flex h-16 w-16 items-center justify-center rounded-full',
              approved
                ? 'bg-(--surface-inverse) text-(--text-inverse) dark:bg-(--surface) dark:text-(--text-primary)'
                : 'bg-(--destructive)/10 text-(--destructive)',
            ]"
          >
            <span class="material-symbols-outlined text-[32px]">
              {{ approved ? 'check' : 'close' }}
            </span>
          </span>


          <div class="mt-4">
            <PaymentStatusBadge :status="payment.status" />
          </div>
        </div>

        <div class="mt-8 border-t border-(--border-default) pt-6 dark:border-(--border-inverse)">
          <PaymentSummary
            :title="payment.title"
            :amount="payment.amount"
            :payer-name="payment.payer_name"
            :payer-cpf="payment.payer_cpf"
          />
        </div>

        <BaseButton
          :label="approved ? 'Fazer novo pagamento' : 'Tentar novamente'"
          :icon="approved ? 'add' : 'refresh'"
          @click="router.push({ name: 'Payment' })"
        />
        <BaseButton
          variant="ghost"
          label="Voltar ao início"
          icon="home"
          icon-position="left"
          @click="router.push({ name: 'Home' })"
        />
      </PaymentCard>
    </div>
  </section>
</template>
