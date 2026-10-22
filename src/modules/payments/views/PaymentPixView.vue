<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton } from '@/shared/components'
import {
  PaymentCard,
  PaymentStatusBadge,
  PaymentSteps,
  PaymentSummary,
  PixCode,
} from '../components'
import { usePaymentsStore } from '../stores'
import type { PaymentStatus } from '../types'

const props = defineProps<{ id: string }>()

const router = useRouter()
const store = usePaymentsStore()

const payment = computed(() => store.find(props.id))

const steps = [
  'Abra o app do seu banco e escolha pagar com Pix.',
  'Escaneie o QR Code ou cole o código copia e cola.',
  'Confirme o valor, finalize e clique em "Já paguei".',
]

function finish(status: PaymentStatus): void {
  store.setStatus(props.id, status)
  router.push({ name: 'PaymentResult', params: { id: props.id } })
}
</script>

<template>
  <section
    class="mx-auto flex min-h-[calc(100svh_-_60px)] w-full max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 md:px-12 xl:px-20"
  >
    <PaymentSteps :current="2" />

    <div v-if="!payment" class="mx-auto mt-10 max-w-xl">
      <PaymentCard
        title="Pagamento indisponível"
        description="Os dados deste pagamento não estão mais disponíveis. Comece um novo."
      >
        <BaseButton
          label="Fazer novo pagamento"
          icon="arrow_forward"
          @click="router.push({ name: 'Payment' })"
        />
      </PaymentCard>
    </div>

    <template v-else>
      <div class="mt-10">
        <h2>Pague com Pix</h2>
        <p class="mt-3 max-w-2xl text-sm text-(--text-secondary) dark:text-(--text-inverse-muted)">
          Escaneie o QR Code ou use o código copia e cola no app do seu banco.
        </p>
      </div>

      <div class="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <PaymentCard>
          <PaymentStatusBadge :status="payment.status" />

          <div class="mx-auto mt-8 max-w-md">
            <PixCode :qr-code="payment.qr_code" />
          </div>

          <div class="mt-8 border-t border-(--border-default) pt-6 dark:border-(--border-inverse)">
            <ol class="grid gap-4 sm:grid-cols-3">
              <li v-for="(step, index) in steps" :key="step" class="flex gap-3 text-sm">
                <span
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-(--border-default) text-xs font-semibold dark:border-(--border-inverse)"
                >
                  {{ index + 1 }}
                </span>
                <span class="text-(--text-secondary) dark:text-(--text-inverse-muted)">
                  {{ step }}
                </span>
              </li>
            </ol>
          </div>
        </PaymentCard>

        <aside class="lg:sticky lg:top-28">
          <PaymentCard title="Resumo">
            <div class="mt-5">
              <PaymentSummary
                :title="payment.title"
                :amount="payment.amount"
                :payer-name="payment.payer_name"
                :payer-cpf="payment.payer_cpf"
              />
            </div>

            <BaseButton label="Já paguei" icon="check" @click="finish('approved')" />

            <!-- só para demonstrar a tela de falha enquanto não há backend -->
            <button
              type="button"
              class="mt-4 w-full cursor-pointer text-center text-xs text-(--text-muted) underline-offset-4 hover:underline active:underline"
              @click="finish('rejected')"
            >
              Simular pagamento recusado
            </button>
          </PaymentCard>

          <BaseButton
            variant="ghost"
            label="Cancelar e voltar"
            icon="arrow_back"
            icon-position="left"
            @click="router.push({ name: 'Payment' })"
          />
        </aside>
      </div>
    </template>
  </section>
</template>
