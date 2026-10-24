<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton, CardComp, SubheaderComp, TopbarComp } from '@/shared/components'
import { formatCurrency } from '../utils'
import { INVOICE_STATUS, type Invoice } from '../utils/billing'
import { usePaymentsStore } from '../stores'
import { BADGE, BADGE_BASE, TOOLBAR_BUTTON } from '../utils/ui'

const router = useRouter()
const store = usePaymentsStore()
const COLUMNS = ['Pagamento', 'Data', 'Valor', 'Status', 'Ação']
const INVOICES = computed<Invoice[]>(() =>
  store.payments.map((payment) => ({
    id: payment.id,
    number: payment.id.slice(0, 8),
    date: new Date(payment.created_at).toLocaleDateString('pt-BR'),
    amount: Number(payment.amount),
    status:
      payment.status === 'approved'
        ? 'paid'
        : ['pending', 'in_process'].includes(payment.status)
          ? 'pending'
          : 'failed',
  })),
)
const PAYMENT_METHODS = computed(() =>
  store.payments.slice(0, 1).map((payment) => ({
    id: payment.id,
    icon: store.methodOf(payment.id) === 'pix' ? 'qr_code_2' : 'credit_card',
    title: store.methodOf(payment.id) === 'pix' ? 'Pix' : 'Cartão',
    description: 'Último pagamento registrado',
    primary: false,
  })),
)
onMounted(async () => {
  try {
    await store.refreshAccess()
    await store.loadAll()
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Não foi possível consultar o faturamento.',
    )
  }
})
function handleInvoice(invoice: Invoice) {
  router.push({ name: 'PaymentResult', params: { id: invoice.id } })
}

function exportInvoices() {
  const lines = [
    'fatura;data;valor;status',
    ...INVOICES.value.map((invoice) =>
      [
        invoice.number,
        invoice.date,
        invoice.amount.toFixed(2),
        INVOICE_STATUS[invoice.status].label,
      ].join(';'),
    ),
  ]
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: 'faturas.csv' })
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div
    class="flex min-h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp :crumbs="['Norte Studio', 'Faturamento']" has-notifications />

    <section class="flex flex-1 flex-col gap-[16px] px-[16px] pt-[24px] pb-[32px] sm:px-[28px]">
      <SubheaderComp
        title="Faturamento"
        description="Plano, método de pagamento e faturas"
        class="mb-0!"
      >
        <div class="flex flex-wrap gap-[8px]">
          <BaseButton
            variant="secondary"
            label="Mudar plano"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="router.push({ name: 'Plans' })"
          />
          <BaseButton
            label="Abrir assistente"
            icon="add"
            icon-position="left"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="router.push({ name: 'Assistant' })"
          />
        </div>
      </SubheaderComp>

      <div class="grid gap-[12px] sm:grid-cols-2 xl:grid-cols-4">
        <CardComp
          title="Plano atual"
          :data="store.isSubscriber ? 'Pro' : 'Free'"
          description="Acesso individual"
        />
        <CardComp
          title="Valor do acesso"
          :data="store.price ? formatCurrency(store.price) : '—'"
          description="Sem renovação automática"
        />
        <CardComp title="Pagamentos" :data="String(store.payments.length)" />
        <CardComp
          title="Acesso à IA"
          :data="store.isSubscriber ? 'Liberado' : 'Aguardando pagamento'"
        />
      </div>

      <div class="grid items-start gap-[16px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <section
          class="overflow-hidden rounded-[16px] border border-(--border-default) bg-(--surface) dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
        >
          <header class="flex items-center justify-between px-[18px] pt-[16px] pb-[12px]">
            <h2 class="text-[15px]! leading-normal! font-semibold! tracking-normal!">Faturas</h2>
            <button
              type="button"
              class="cursor-pointer text-[13px] font-medium text-(--bg-orange) hover:underline"
              @click="exportInvoices"
            >
              Exportar
            </button>
          </header>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr
                  class="border-y border-(--border-default) bg-(--bg-subtle) dark:border-(--border-inverse) dark:bg-black/20"
                >
                  <th
                    v-for="column in COLUMNS"
                    :key="column"
                    scope="col"
                    class="px-[18px] py-[9px] text-[12px] leading-normal font-normal text-(--text-secondary) dark:text-(--text-inverse-muted)"
                  >
                    {{ column }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="invoice in INVOICES"
                  :key="invoice.id"
                  class="border-b border-(--border-default) text-[13px] leading-normal last:border-b-0 dark:border-(--border-inverse)"
                >
                  <td class="px-[18px] py-[12px] font-mono text-[12px]">{{ invoice.number }}</td>
                  <td class="px-[18px] py-[12px]">{{ invoice.date }}</td>
                  <td class="px-[18px] py-[12px]">{{ formatCurrency(invoice.amount) }}</td>
                  <td class="px-[18px] py-[12px]">
                    <span :class="[BADGE_BASE, BADGE[INVOICE_STATUS[invoice.status].tone]]">
                      {{ INVOICE_STATUS[invoice.status].label }}
                    </span>
                  </td>
                  <td class="px-[18px] py-[12px]">
                    <button
                      type="button"
                      :class="[
                        'cursor-pointer hover:underline',
                        invoice.status === 'paid'
                          ? 'text-(--text-secondary) dark:text-(--text-inverse-muted)'
                          : 'font-semibold',
                      ]"
                      @click="handleInvoice(invoice)"
                    >
                      {{ INVOICE_STATUS[invoice.status].action }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section
          class="flex flex-col rounded-[16px] border border-(--border-default) bg-(--surface) px-[18px] pt-[16px] pb-[6px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
        >
          <header class="flex items-center justify-between pb-[4px]">
            <h2 class="text-[15px]! leading-normal! font-semibold! tracking-normal!">
              Método de pagamento
            </h2>
            <button
              type="button"
              class="cursor-pointer text-[13px] font-medium text-(--bg-orange) hover:underline"
              @click="router.push({ name: 'Payment' })"
            >
              Alterar
            </button>
          </header>
          <ul class="flex flex-col">
            <li
              v-for="item in PAYMENT_METHODS"
              :key="item.id"
              class="flex items-center gap-[12px] border-b border-(--border-default) py-[12px] last:border-b-0 dark:border-(--border-inverse)"
            >
              <span
                class="grid size-[32px] shrink-0 place-items-center rounded-[9px] bg-(--bg-muted) dark:bg-black/30"
                aria-hidden="true"
              >
                <span
                  class="material-symbols-outlined text-[17px]! text-(--text-secondary) dark:text-(--text-inverse-muted)"
                  >{{ item.icon }}</span
                >
              </span>
              <span class="flex min-w-0 flex-1 flex-col leading-normal">
                <span class="text-[13.5px] font-medium">{{ item.title }}</span>
                <span class="truncate text-[12px] text-(--text-muted)">{{ item.description }}</span>
              </span>
              <span v-if="item.primary" :class="[BADGE_BASE, BADGE.success]">Principal</span>
            </li>
          </ul>
        </section>
      </div>
    </section>
  </div>
</template>
