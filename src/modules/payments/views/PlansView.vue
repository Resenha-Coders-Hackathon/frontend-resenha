<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BillingToggle, PaymentPage, PlanCard } from '../components'
import type { BillingCycle, Plan } from '../types'
import { PLANS } from '../utils/plans'

const router = useRouter()
const cycle = ref<BillingCycle>('monthly')
// plano atual da organização de exemplo
const currentPlan = 'free'

function choose(plan: Plan) {
  if (plan.id === 'enterprise') {
    toast.success('Recebemos seu interesse! Nosso time comercial vai entrar em contato.')
    return
  }
  router.push({ name: 'Payment', query: { plano: plan.id, ciclo: cycle.value } })
}
</script>

<template>
  <PaymentPage :crumbs="['Norte Studio', 'Conta', 'Planos']">
    <header class="flex flex-col items-center gap-[10px] pt-[16px] text-center">
      <p
        class="font-mono text-[11px] leading-normal tracking-[0.16em] text-(--bg-orange) uppercase"
      >
        Planos e faturamento
      </p>
      <h1 class="text-[30px]! leading-tight! font-semibold! tracking-[-0.03em]! sm:text-[36px]!">
        O Kanban é grátis. A IA trabalha no Pro.
      </h1>
      <p
        class="max-w-[600px] text-[14px] leading-[22px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
      >
        Comece com o time inteiro sem pagar nada e ative o assistente quando a demanda crescer.
      </p>
      <BillingToggle v-model="cycle" class="mt-[6px]" />
    </header>

    <div class="mt-[12px] grid items-start gap-[18px] lg:grid-cols-3">
      <PlanCard
        v-for="plan in PLANS"
        :key="plan.id"
        :plan="plan"
        :cycle="cycle"
        :current="plan.id === currentPlan"
        @select="choose(plan)"
      />
    </div>

    <p class="text-center text-[12px] leading-normal text-(--text-muted)">
      Valores de exemplo para o protótipo. Cobrança por membro ativo; convidados são gratuitos.
    </p>
  </PaymentPage>
</template>
