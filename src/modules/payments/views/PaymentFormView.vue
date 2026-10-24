<script setup lang="ts">
import { computed, ref } from 'vue'
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
import type { BillingCycle, PaymentMethod } from '../types'
import {
  cardBrand,
  CARD_BRAND_LABELS,
  formatCurrency,
  isValidCardNumber,
  isValidExpiry,
  maskCardNumber,
  maskCpf,
  maskCurrency,
  maskExpiry,
  onlyDigits,
  parseCurrency,
} from '../utils'
import { CYCLE_LABELS, findPlan, ORG_MEMBERS, planPrice, planTotal } from '../utils/plans'

const route = useRoute()
const router = useRouter()
const store = usePaymentsStore()

// vindo da página de planos: ?plano=pro&ciclo=yearly
const plan = computed(() => {
  const found = findPlan(route.query.plano)
  return found && found.monthlyPrice > 0 ? found : undefined
})
const cycle = computed<BillingCycle>(() => (route.query.ciclo === 'yearly' ? 'yearly' : 'monthly'))

const method = ref<PaymentMethod>('card')
// vindo do faturamento: ?descricao=Fatura #0482&valor=480.00
const queryText = (value: unknown) => (typeof value === 'string' ? value : '')
const title = ref(
  plan.value
    ? `Plano ${plan.value.name} — ${CYCLE_LABELS[cycle.value]}`
    : queryText(route.query.descricao),
)
const amount = ref(
  maskCurrency(
    plan.value ? planTotal(plan.value.id, cycle.value).toFixed(2) : queryText(route.query.valor),
  ),
)
const name = ref('')
const cpf = ref('')
const cardNumber = ref('')
const expiry = ref('')
const cvv = ref('')
const installments = ref(1)
const isSubmitting = ref(false)

const amountModel = computed({
  get: () => amount.value,
  set: (value: string) => (amount.value = maskCurrency(value)),
})
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

const amountValue = computed(() => parseCurrency(amount.value))
const isTrial = computed(() => plan.value?.id === 'pro')
// primeira cobrança depois dos 14 dias de teste
const firstCharge = computed(() =>
  new Date(Date.now() + 14 * 86_400_000).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }),
)
const submitLabel = computed(() => {
  if (method.value === 'pix') return 'Gerar QR Code Pix'
  return isTrial.value
    ? 'Começar 14 dias grátis'
    : `Pagar ${formatCurrency(amountValue.value || 0)}`
})
const brand = computed(() => cardBrand(cardNumber.value))

const installmentOptions = computed(() => {
  const total = Number(amountValue.value) || 0
  return Array.from({ length: 12 }, (_, index) => {
    const count = index + 1
    return { value: count, label: `${count}x de ${formatCurrency(total / count)} sem juros` }
  })
})

const planDetails = computed(() =>
  plan.value
    ? [
        { label: 'Plano', value: `${plan.value.name} · ${CYCLE_LABELS[cycle.value]}` },
        {
          label: 'Membros',
          value: `${ORG_MEMBERS} × ${formatCurrency(planPrice(plan.value, cycle.value))}${cycle.value === 'yearly' ? ' × 12' : ''}`,
        },
      ]
    : [],
)

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
  const error = validate()
  if (error) {
    toast.error(error)
    return
  }

  isSubmitting.value = true
  try {
    const payment =
      method.value === 'card'
        ? await store.createCard({
            title: title.value.trim(),
            amount: amountValue.value,
            holder: name.value.trim(),
            cpf: onlyDigits(cpf.value),
            last4: onlyDigits(cardNumber.value).slice(-4),
            brand: brand.value,
            installments: installments.value,
          })
        : await store.create({
            title: title.value.trim(),
            amount: amountValue.value,
            name: name.value.trim(),
            cpf: onlyDigits(cpf.value),
          })
    router.push({
      name: method.value === 'card' ? 'PaymentResult' : 'PaymentPix',
      params: { id: payment.id },
    })
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Não foi possível concluir o pagamento.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <PaymentPage
    :crumbs="['Norte Studio', plan ? 'Planos' : 'Pagamentos', 'Pagamento']"
    :title="plan ? `Assinar o plano ${plan.name}` : 'Novo pagamento'"
    :description="
      plan
        ? 'Escolha como pagar. Você pode trocar de plano ou cancelar quando quiser.'
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
          description="O que está sendo pago e qual o valor."
        >
          <div class="flex flex-col gap-[14px] sm:flex-row">
            <PaymentField
              id="payment-title"
              v-model="title"
              label="Descrição"
              icon="description"
              placeholder="Ex.: Frete São Paulo → Joinville"
            />
            <PaymentField
              id="payment-amount"
              v-model="amountModel"
              label="Valor (R$)"
              icon="payments"
              placeholder="0,00"
              inputmode="numeric"
              class="sm:max-w-[200px]"
              @keydown="restrictNumericInput($event, 10)"
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

          <p
            v-if="isTrial && method === 'card'"
            class="flex items-start gap-[8px] rounded-[10px] bg-(--plan-pro-soft) px-[12px] py-[10px] text-[12.5px] leading-[18px] text-(--plan-pro)"
          >
            <span class="material-symbols-outlined text-[16px]!" aria-hidden="true"
              >auto_awesome</span
            >
            14 dias grátis. A primeira cobrança de {{ formatCurrency(amountValue || 0) }} acontece
            em {{ firstCharge }}, e você pode cancelar antes.
          </p>

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
              method === 'card'
                ? 'Demonstração: nenhum cartão é cobrado'
                : 'Pagamento seguro via Pix'
            }}
          </p>
        </PaymentCard>
      </aside>
    </div>
  </PaymentPage>
</template>
