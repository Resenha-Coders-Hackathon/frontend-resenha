<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton } from '@/shared/components'
import {
  CardPreview,
  PaymentCard,
  PaymentField,
  PaymentMethodTabs,
  PaymentPage,
  PaymentSteps,
  PaymentSummary,
} from '../components'
import { usePaymentsStore } from '../stores'
import type { PaymentMethod } from '../types'
import {
  cardBrand,
  CARD_BRAND_LABELS,
  formatCurrency,
  isValidCardNumber,
  isValidExpiry,
  maskCardNumber,
  maskCpf,
  maskExpiry,
  onlyDigits,
} from '../utils'
import { findPlan } from '../utils/plans'

const route = useRoute()
const router = useRouter()
const store = usePaymentsStore()

const plan = computed(() => findPlan(route.query.plano))
const method = ref<PaymentMethod>('card')
const title = ref('Acesso Pro — Assistente IA')
const amountValue = computed(() => store.price ?? '')

onMounted(async () => {
  try {
    await store.refreshAccess()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Não foi possível consultar o valor.')
  }
})

const name = ref('')
const cpf = ref('')
const cardNumber = ref('')
const expiry = ref('')
const cvv = ref('')
const installments = ref(1)
const isSubmitting = ref(false)

const cpfModel = computed({
  get: () => cpf.value,
  set: (value: string) => (cpf.value = maskCpf(value)),
})
const cardModel = computed({
  get: () => cardNumber.value,
  set: (value: string) => (cardNumber.value = maskCardNumber(value)),
})
const expiryModel = computed({
  get: () => expiry.value,
  set: (value: string) => (expiry.value = maskExpiry(value)),
})
const cvvModel = computed({
  get: () => cvv.value,
  set: (value: string) => (cvv.value = onlyDigits(value).slice(0, brand.value === 'amex' ? 4 : 3)),
})

const submitLabel = computed(() =>
  method.value === 'pix' ? 'Gerar QR Code Pix' : `Pagar ${formatCurrency(amountValue.value || 0)}`,
)
const brand = computed(() => cardBrand(cardNumber.value))
// Uma cobrança única, com o preço do backend; não oferece parcelas ou teste fictícios.
const installmentOptions = computed(() => [
  { value: 1, label: `1x de ${formatCurrency(amountValue.value || 0)}` },
])
const planDetails = [{ label: 'Plano', value: 'Pro · acesso à IA' }]

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
  if (!(Number(amountValue.value) > 0)) return 'Aguarde a consulta do valor do pagamento.'
  if (name.value.trim().split(/\s+/).length < 2)
    return method.value === 'card'
      ? 'Informe o nome como está no cartão.'
      : 'Informe o nome completo do pagador.'
  if (onlyDigits(cpf.value).length !== 11) return 'O CPF deve ter 11 dígitos.'
  if (method.value === 'card') {
    if (!isValidCardNumber(cardNumber.value)) return 'Confira o número do cartão.'
    if (!isValidExpiry(expiry.value)) return 'Confira a validade do cartão (MM/AA).'
    if (cvv.value.length < (brand.value === 'amex' ? 4 : 3))
      return 'Confira o código de segurança (CVV).'
  }
  return null
}

async function handleSubmit(): Promise<void> {
  if (isSubmitting.value) return
  const error = validate()
  if (error) {
    toast.error(error)
    return
  }

  isSubmitting.value = true
  const selectedMethod = method.value
  try {
    const payment =
      selectedMethod === 'card'
        ? await store.createCard({
            title: title.value.trim(),
            holder: name.value.trim(),
            cpf: onlyDigits(cpf.value),
            number: cardNumber.value,
            expiry: expiry.value,
            cvv: cvv.value,
            installments: installments.value,
          })
        : await store.create({
            title: title.value.trim(),
            name: name.value.trim(),
            cpf: onlyDigits(cpf.value),
          })
    router.push({
      name: selectedMethod === 'card' ? 'PaymentResult' : 'PaymentPix',
      params: { id: payment.payment_id },
    })
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Não foi possível concluir o pagamento.')
  } finally {
    cardNumber.value = ''
    cvv.value = ''
    isSubmitting.value = false
  }
}
</script>

<template>
  <PaymentPage
    :crumbs="[plan ? 'Planos' : 'Pagamentos', 'Pagamento']"
    :title="plan ? `Assinar o plano ${plan.name}` : 'Novo pagamento'"
    :description="
      plan
        ? 'Escolha como pagar. O acesso será liberado após a confirmação.'
        : 'Preencha os dados e escolha pagar com cartão de crédito ou Pix.'
    "
  >
    <template #top>
      <PaymentSteps :current="1" />
    </template>

    <div class="grid items-start gap-[20px] lg:grid-cols-[minmax(0,1fr)_360px]">
      <form
        id="payment-form"
        class="flex flex-col gap-[16px]"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <PaymentCard
          v-if="!plan"
          title="Dados do pagamento"
          description="O valor é definido pelo servidor."
        >
          <div class="flex flex-col gap-[14px] sm:flex-row">
            <PaymentField
              id="payment-title"
              v-model="title"
              label="Descrição"
              icon="description"
              placeholder="Acesso Pro — Assistente IA"
            />
          </div>
        </PaymentCard>

        <PaymentCard title="Forma de pagamento">
          <PaymentMethodTabs v-model="method" />

          <div v-if="method === 'card'" class="flex flex-col gap-[14px] pt-[4px]">
            <CardPreview
              :number="cardNumber"
              :holder="name"
              :expiry="expiry"
              :brand="brand"
              class="mx-auto sm:mx-0"
            />

            <PaymentField
              id="card-number"
              v-model="cardModel"
              label="Número do cartão"
              icon="credit_card"
              placeholder="0000 0000 0000 0000"
              inputmode="numeric"
              autocomplete="cc-number"
              @keydown="restrictNumericInput($event, brand === 'amex' ? 15 : 16)"
            >
              <template #suffix>
                <span
                  v-if="brand !== 'unknown'"
                  class="shrink-0 text-[12px] font-semibold text-(--text-secondary) dark:text-(--text-inverse-muted)"
                >
                  {{ CARD_BRAND_LABELS[brand] }}
                </span>
              </template>
            </PaymentField>
            <PaymentField
              id="card-holder"
              v-model="name"
              label="Nome impresso no cartão"
              icon="person"
              placeholder="Maria S Silva"
              autocomplete="cc-name"
            />
            <div class="flex flex-col gap-[14px] sm:flex-row">
              <PaymentField
                id="card-expiry"
                v-model="expiryModel"
                label="Validade"
                icon="calendar_month"
                placeholder="MM/AA"
                inputmode="numeric"
                autocomplete="cc-exp"
                @keydown="restrictNumericInput($event, 4)"
              />
              <PaymentField
                id="card-cvv"
                v-model="cvvModel"
                label="CVV"
                icon="lock"
                :placeholder="brand === 'amex' ? '0000' : '000'"
                inputmode="numeric"
                autocomplete="cc-csc"
                hint="3 dígitos no verso (Amex: 4 na frente)"
              />
              <PaymentField
                id="card-cpf"
                v-model="cpfModel"
                label="CPF do titular"
                icon="badge"
                placeholder="000.000.000-00"
                inputmode="numeric"
                @keydown="restrictNumericInput($event, 11)"
              />
            </div>

            <div class="flex flex-col gap-[6px]">
              <label for="card-installments" class="text-[13px] leading-normal font-medium"
                >Parcelas</label
              >
              <div class="relative">
                <select
                  id="card-installments"
                  v-model.number="installments"
                  class="h-[44px] w-full appearance-none rounded-[10px] border border-(--border-default) bg-(--surface) pr-[36px] pl-[12px] text-[14px] outline-none focus:border-(--border-strong) dark:border-(--border-inverse) dark:bg-black/30 dark:focus:border-(--text-inverse-muted)"
                >
                  <option
                    v-for="option in installmentOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <span
                  class="material-symbols-outlined pointer-events-none absolute top-1/2 right-[10px] -translate-y-1/2 text-[18px]! text-(--text-muted)"
                  aria-hidden="true"
                  >unfold_more</span
                >
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col gap-[14px] pt-[4px]">
            <p
              class="text-[13px] leading-[20px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
            >
              Vamos gerar um QR Code Pix para você pagar pelo app do seu banco.
            </p>
            <div class="flex flex-col gap-[14px] sm:flex-row">
              <PaymentField
                id="pix-name"
                v-model="name"
                label="Nome completo"
                icon="person"
                placeholder="Maria Silva"
                autocomplete="name"
              />
              <PaymentField
                id="pix-cpf"
                v-model="cpfModel"
                label="CPF"
                icon="badge"
                placeholder="000.000.000-00"
                inputmode="numeric"
                @keydown="restrictNumericInput($event, 11)"
              />
            </div>
          </div>
        </PaymentCard>
      </form>

      <aside class="lg:sticky lg:top-[24px]">
        <PaymentCard title="Resumo">
          <PaymentSummary
            :title="title"
            :amount="amountValue || '0'"
            :method="method"
            :details="planDetails"
          />

          <BaseButton
            type="submit"
            form="payment-form"
            :label="submitLabel"
            :icon="method === 'card' ? 'lock' : 'qr_code_2'"
            icon-position="left"
            :loading="isSubmitting"
            class="mt-0! h-[44px]! rounded-[10px]! py-0! text-[14px]! [&_.material-symbols-outlined]:text-[17px]!"
          />

          <p
            class="flex items-center justify-center gap-[4px] text-[12px] leading-normal text-(--text-muted)"
          >
            <span class="material-symbols-outlined text-[15px]!" aria-hidden="true"
              >verified_user</span
            >
            {{
              method === 'card' ? 'Pagamento seguro via Mercado Pago' : 'Pagamento seguro via Pix'
            }}
          </p>
        </PaymentCard>
      </aside>
    </div>
  </PaymentPage>
</template>
