<script setup lang="ts">
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton, CardComp, SubheaderComp, TopbarComp } from '@/shared/components'
import { formatCurrency } from '../utils'
import {
  INVOICES,
  INVOICE_STATUS,
  PAYMENT_METHODS,
  SUBSCRIPTION,
  type Invoice,
} from '../utils/billing'
import { BADGE, BADGE_BASE, TOOLBAR_BUTTON } from '../utils/ui'

// Página só de interface: os dados são de exemplo e as ações não chamam o backend.

const router = useRouter()
const COLUMNS = ['Fatura', 'Data', 'Valor', 'Status', 'Ação']

function handleInvoice(invoice: Invoice) {
  if (invoice.status === 'paid') {
    toast.success(`Baixando a fatura ${invoice.number} (demonstração).`)
    return
  }
  router.push({
    name: 'Payment',
    query: { descricao: `Fatura ${invoice.number}`, valor: invoice.amount.toFixed(2) },
  })
}

function exportInvoices() {
  const lines = [
    'fatura;data;valor;status',
    ...INVOICES.map((invoice) =>
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
    class="flex min-h-[calc(100dvh-6rem)] w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
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
            label="Adicionar assentos"
            icon="add"
            icon-position="left"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="toast.success('Pedido de novos assentos enviado (demonstração).')"
          />
        </div>
      </SubheaderComp>

      <div class="grid gap-[12px] sm:grid-cols-2 xl:grid-cols-4">
        <CardComp
          title="Plano atual"
          :data="SUBSCRIPTION.plan"
          :description="`${SUBSCRIPTION.cycle} · ${formatCurrency(SUBSCRIPTION.pricePerSeat).replace(',00', '')}/membro`"
        />
        <CardComp
          title="Próxima cobrança"
          :data="formatCurrency(SUBSCRIPTION.nextCharge)"
          :description="`em ${SUBSCRIPTION.nextChargeDate}`"
        />
        <CardComp
          title="Assentos em uso"
          :data="`${SUBSCRIPTION.seatsUsed} de ${SUBSCRIPTION.seats}`"
        />
        <CardComp
          title="Créditos de IA"
          :data="`${SUBSCRIPTION.credits.used}/${SUBSCRIPTION.credits.total}`"
          :description="`renova em ${SUBSCRIPTION.credits.renewsAt}`"
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
              @click="toast.success('Troca de método disponível quando o cartão for integrado.')"
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
