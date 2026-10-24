<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { BaseButton } from '@/shared/components'
import { useChargesStore } from '../stores'
import type { Charge, PayChargeResponse } from '../types'
import { formatCurrency } from '../utils'
import PixCode from './pixCode.vue'

/* Pagar uma cobrança: dados do pagador -> QR Code Pix -> resultado (aprovado ou recusado). */
const props = defineProps<{ charge: Charge; taskId: string }>()
const emit = defineEmits<{ close: [paid: boolean] }>()

const POLL_MS = 3000
const store = useChargesStore()
const dialog = ref<HTMLDialogElement | null>(null)
const stage = ref<'form' | 'qr' | 'approved' | 'rejected'>('form')
const pix = ref<PayChargeResponse | null>(null)
const busy = ref(false)
const error = ref('')
let timer: ReturnType<typeof setInterval> | undefined
let polling = false

const remaining = Math.max(Number(props.charge.goal_amount) - Number(props.charge.raised), 1)
const amount = ref(remaining.toFixed(2))
const name = ref('')
const cpf = ref('')
const message = ref('')
const anonymous = ref(false)
const valid = computed(
  () => Number(amount.value) >= 1 && name.value.trim() && cpf.value.length >= 11,
)

async function submit() {
  if (!valid.value || busy.value) return
  busy.value = true
  error.value = ''
  try {
    pix.value = await store.pay(props.charge, {
      amount: Number(amount.value).toFixed(2),
      cpf: cpf.value,
      name: name.value.trim(),
      message: message.value.trim(),
      anonymous: anonymous.value,
    })
    stage.value = 'qr'
    timer = setInterval(check, POLL_MS)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Não foi possível gerar o Pix.'
  } finally {
    busy.value = false
  }
}

// o webhook do Mercado Pago atualiza o pagamento; aqui só perguntamos o resultado
async function check() {
  if (polling || !pix.value) return
  polling = true
  try {
    const result = await store.result(pix.value.contribution_id, props.taskId)
    if (result === 'pending') return
    clearInterval(timer)
    stage.value = result
  } catch {
    // falha de rede: tenta de novo no próximo ciclo
  } finally {
    polling = false
  }
}

onMounted(() => dialog.value?.showModal())
onBeforeUnmount(() => {
  clearInterval(timer)
  dialog.value?.close()
})

const input =
  'h-10 w-full rounded-lg border border-(--border-default) bg-transparent px-3 text-[14px] dark:border-(--border-inverse)'
</script>

<template>
  <dialog
    ref="dialog"
    aria-labelledby="charge-title"
    class="m-auto max-h-[calc(100dvh_-_1.5rem)] w-[calc(100%_-_1.5rem)] max-w-md overflow-y-auto rounded-2xl border border-(--border-default) bg-(--surface) p-5 text-(--text-primary) shadow-xl backdrop:bg-black/70 dark:border-(--border-inverse) dark:bg-(--surface-inverse) dark:text-(--text-inverse)"
    @cancel.prevent="emit('close', stage === 'approved')"
  >
    <header class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 id="charge-title" class="text-lg font-semibold">
          <template v-if="stage === 'approved'">Pagamento aprovado</template>
          <template v-else-if="stage === 'rejected'">Pagamento recusado</template>
          <template v-else>{{ charge.title }}</template>
        </h2>
        <p v-if="stage === 'form' || stage === 'qr'" class="text-sm text-(--text-muted)">
          {{ stage === 'qr' ? 'Pague com Pix' : 'Pagar com Pix' }} ·
          {{ formatCurrency(stage === 'qr' ? amount : remaining) }}
        </p>
      </div>
      <button
        type="button"
        aria-label="Fechar"
        class="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-(--bg-subtle) dark:hover:bg-black/30"
        @click="emit('close', stage === 'approved')"
      >
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
    </header>

    <form v-if="stage === 'form'" class="grid gap-3" @submit.prevent="submit">
      <label class="grid gap-1 text-[13px] font-medium"
        >Valor (R$)
        <input v-model="amount" type="number" min="1" step="0.01" required :class="input" />
      </label>
      <label class="grid gap-1 text-[13px] font-medium"
        >Nome completo
        <input v-model="name" required maxlength="255" autocomplete="name" :class="input" />
      </label>
      <label class="grid gap-1 text-[13px] font-medium"
        >CPF
        <input
          v-model="cpf"
          required
          inputmode="numeric"
          maxlength="14"
          placeholder="000.000.000-00"
          :class="input"
          @input="cpf = cpf.replace(/[^\d.-]/g, '')"
        />
      </label>
      <label class="grid gap-1 text-[13px] font-medium"
        >Mensagem (opcional)
        <input v-model="message" maxlength="255" :class="input" />
      </label>
      <label class="flex items-center gap-2 text-[13px]">
        <input v-model="anonymous" type="checkbox" /> Pagar de forma anônima
      </label>
      <p v-if="error" role="alert" class="text-[13px] text-(--destructive)">{{ error }}</p>
      <BaseButton type="submit" label="Gerar QR Code Pix" :loading="busy" :disabled="!valid" />
    </form>

    <div v-else-if="stage === 'qr' && pix" class="grid gap-3">
      <PixCode :qr-code="pix.qr_code" :qr-code-base64="pix.qr_code_base64" />
      <p
        class="flex items-center justify-center gap-2 text-[13px] text-(--text-muted)"
        role="status"
      >
        <span class="material-symbols-outlined animate-spin text-[18px]!" aria-hidden="true"
          >progress_activity</span
        >
        Aguardando a confirmação do pagamento…
      </p>
    </div>

    <div v-else class="grid justify-items-center gap-3 py-4 text-center" role="status">
      <span
        :class="[
          'material-symbols-outlined text-[56px]!',
          stage === 'approved' ? 'text-(--sucess)' : 'text-(--destructive)',
        ]"
        aria-hidden="true"
        >{{ stage === 'approved' ? 'check_circle' : 'cancel' }}</span
      >
      <p class="text-[14px]">
        {{
          stage === 'approved'
            ? `Recebemos ${formatCurrency(amount)}. Obrigado!`
            : 'O pagamento não foi concluído. Você pode tentar novamente.'
        }}
      </p>
      <BaseButton
        :label="stage === 'approved' ? 'Concluir' : 'Fechar'"
        :full-width="false"
        @click="emit('close', stage === 'approved')"
      />
    </div>
  </dialog>
</template>
