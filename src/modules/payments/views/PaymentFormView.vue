<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton, BaseInput } from '@/shared/components'
import { PaymentCard, PaymentSteps, PaymentSummary } from '../components'
import { usePaymentsStore } from '../stores'
import { maskCpf, maskCurrency, onlyDigits, parseCurrency } from '../utils'

const router = useRouter()
const store = usePaymentsStore()

const title = ref('')
const amount = ref('')
const name = ref('')
const cpf = ref('')

const amountModel = computed({
  get: () => amount.value,
  set: (value: string) => (amount.value = maskCurrency(value)),
})

const cpfModel = computed({
  get: () => cpf.value,
  set: (value: string) => (cpf.value = maskCpf(value)),
})

const amountValue = computed(() => parseCurrency(amount.value))

function restrictNumericInput(event: KeyboardEvent, maxDigits: number): void {
  if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return

  if (!/\d/.test(event.key)) {
    event.preventDefault()
    return
  }

  const input = event.target
  if (!(input instanceof HTMLInputElement)) return

  const start = input.selectionStart ?? input.value.length
  const end = input.selectionEnd ?? start
  const remainingDigits = onlyDigits(input.value.slice(0, start) + input.value.slice(end)).length

  if (remainingDigits >= maxDigits) event.preventDefault()
}

function validate(): string | null {
  if (!title.value.trim()) return 'Informe a descrição do pagamento.'
  if (!(Number(amountValue.value) > 0)) return 'Informe um valor maior que zero.'
  if (name.value.trim().split(/\s+/).length < 2) return 'Informe o nome completo do pagador.'
  if (onlyDigits(cpf.value).length !== 11) return 'O CPF deve ter 11 dígitos.'
  return null
}

function handleSubmit(): void {
  const error = validate()
  if (error) {
    toast.error(error)
    return
  }

  const payment = store.create({
    title: title.value.trim(),
    amount: amountValue.value,
    name: name.value.trim(),
    cpf: onlyDigits(cpf.value),
  })
  router.push({ name: 'PaymentPix', params: { id: payment.id } })
}
</script>

<template>
  <section
    class="mx-auto flex min-h-[calc(100svh_-_60px)] w-full max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 md:px-12 xl:px-20"
  >
    <PaymentSteps :current="1" />

    <div class="mt-10">
      <h2>Pagamento via Pix</h2>
      <p class="mt-3 max-w-2xl text-sm text-(--text-secondary) dark:text-(--text-inverse-muted)">
        Preencha os dados abaixo. Vamos gerar um QR Code Pix para você pagar pelo app do seu banco.
      </p>
    </div>

    <div class="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form id="payment-form" novalidate @submit.prevent="handleSubmit">
        <PaymentCard title="Dados do pagamento" description="O que está sendo pago e qual o valor.">
          <BaseInput
            v-model="title"
            label="Descrição"
            placeholder="Ex.: Frete São Paulo → Joinville"
            icon="description"
            required
          />
          <BaseInput
            v-model="amountModel"
            label="Valor (R$)"
            placeholder="0,00"
            icon="payments"
            inputmode="numeric"
            @keydown="restrictNumericInput($event, 10)"
            required
          />

          <div class="mt-8 border-t border-(--border-default) pt-8 dark:border-(--border-inverse)">
            <h3 class="text-lg leading-7 font-semibold">Dados do pagador</h3>
            <p class="mt-1 text-sm text-(--text-secondary) dark:text-(--text-inverse-muted)">
              Necessários para emitir o Pix.
            </p>

            <div class="grid gap-x-4 sm:grid-cols-2">
              <BaseInput
                v-model="name"
                label="Nome completo"
                placeholder="Maria Silva"
                icon="person"
                autocomplete="name"
                required
              />
              <BaseInput
                v-model="cpfModel"
                label="CPF"
                placeholder="000.000.000-00"
                icon="badge"
                inputmode="numeric"
                @keydown="restrictNumericInput($event, 11)"
                required
              />
            </div>
          </div>
        </PaymentCard>
      </form>

      <aside class="lg:sticky lg:top-28">
        <PaymentCard title="Resumo">
          <div class="mt-5">
            <PaymentSummary :title="title" :amount="amountValue || '0'" />
          </div>

          <BaseButton
            type="submit"
            form="payment-form"
            label="Gerar QR Code Pix"
            icon="qr_code_2"
          />

          <p class="mt-4 flex items-center justify-center gap-1 text-xs text-(--text-muted)">
            <span class="material-symbols-outlined text-[16px]">lock</span>
            Pagamento seguro via Pix
          </p>
        </PaymentCard>
      </aside>
    </div>
  </section>
</template>
