<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '@/app/plugins/axios'
import { BaseButton } from '@/shared/components'
import { createCharge, listCharges } from '../services'
import type { Charge } from '../types'
import ChargePayDialog from './chargePayDialog.vue'

/* Cobranças da tarefa: lista com "Pagar" (Pix) e, para quem edita, o formulário para criar. */
const props = defineProps<{ taskId: string; canEdit: boolean }>()

const charges = ref<Charge[]>([])
const creating = ref(false)
const saving = ref(false)
const paying = ref<Charge | null>(null)
const title = ref('')
const amount = ref('')
const deadline = ref('')

const money = (value: string) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const due = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })

async function load() {
  try {
    charges.value = await listCharges(props.taskId)
  } catch (error) {
    toast.error(getErrorMessage(error, 'Não foi possível carregar as cobranças.'))
  }
}
onMounted(load)
watch(() => props.taskId, load)

async function add() {
  if (saving.value) return
  saving.value = true
  try {
    await createCharge(props.taskId, {
      title: title.value.trim(),
      goal_amount: Number(amount.value).toFixed(2),
      deadline: deadline.value || null,
    })
    title.value = amount.value = deadline.value = ''
    creating.value = false
    await load()
  } catch (error) {
    toast.error(getErrorMessage(error, 'Não foi possível criar a cobrança.'))
  } finally {
    saving.value = false
  }
}

async function closed(paid: boolean) {
  paying.value = null
  if (paid) toast.success('Pagamento aprovado.')
  await load()
}

const field =
  'h-9 rounded-lg border border-(--border-default) bg-transparent px-2 text-[13px] dark:border-(--border-inverse)'
</script>

<template>
  <div class="grid gap-2.5">
    <button
      v-if="canEdit"
      type="button"
      class="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-(--border-default) px-3 py-2 text-[13px] font-medium hover:bg-(--bg-subtle) dark:border-(--border-inverse) dark:hover:bg-white/10"
      :aria-expanded="creating"
      @click="creating = !creating"
    >
      <span
        class="material-symbols-outlined grid size-8 place-items-center rounded-lg bg-[#ff67001f] text-[18px]! text-[#e8590c]"
        aria-hidden="true"
        >credit_card</span
      >
      Cobrança
    </button>

    <form v-if="creating" class="flex flex-wrap gap-2" @submit.prevent="add">
      <input
        v-model="title"
        required
        maxlength="255"
        placeholder="Descrição (ex.: Fatura #0482)"
        aria-label="Descrição da cobrança"
        :class="[field, 'min-w-48 flex-[2]']"
      />
      <input
        v-model="amount"
        required
        type="number"
        min="1"
        step="0.01"
        placeholder="Valor (R$)"
        aria-label="Valor da cobrança"
        :class="[field, 'w-32']"
      />
      <input v-model="deadline" type="date" aria-label="Vencimento" :class="[field, 'w-40']" />
      <BaseButton
        type="submit"
        label="Criar"
        size="sm"
        :full-width="false"
        :loading="saving"
        :disabled="!title.trim() || Number(amount) < 1"
      />
    </form>

    <ul v-if="charges.length" class="grid gap-2">
      <li
        v-for="charge in charges"
        :key="charge.id"
        class="flex items-center gap-3 rounded-xl border border-(--border-default) p-3.5 dark:border-(--border-inverse)"
      >
        <span
          class="material-symbols-outlined grid size-8 shrink-0 place-items-center rounded-lg bg-[#ff67001f] text-[18px]! text-[#e8590c]"
          aria-hidden="true"
          >credit_card</span
        >
        <span class="min-w-0 flex-1">
          <span class="block truncate text-[13.5px] font-medium">{{ charge.title }}</span>
          <span class="block text-[12px] text-(--text-muted)"
            >{{ money(charge.goal_amount) }}
            <template v-if="charge.deadline">· vence {{ due(charge.deadline) }}</template>
            <template v-if="!charge.paid && Number(charge.raised) > 0">
              · {{ money(charge.raised) }} pago</template
            ></span
          >
        </span>
        <span
          :class="[
            'rounded-full px-2.5 py-0.5 text-[11.5px] font-medium',
            charge.paid
              ? 'bg-(--sucess)/10 text-(--sucess)'
              : charge.status === 'closed'
                ? 'bg-(--bg-muted) text-(--text-muted)'
                : 'bg-[#fdf1dc] text-[#a35a00] dark:bg-[#d97706]/20 dark:text-[#f5b14c]',
          ]"
          >{{ charge.paid ? 'Pago' : charge.status === 'closed' ? 'Encerrada' : 'Pendente' }}</span
        >
        <BaseButton
          v-if="!charge.paid && charge.status === 'active'"
          label="Pagar"
          size="sm"
          :full-width="false"
          @click="paying = charge"
        />
      </li>
    </ul>

    <ChargePayDialog v-if="paying" :charge="paying" @close="closed" />
  </div>
</template>
