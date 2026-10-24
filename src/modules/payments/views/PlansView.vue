<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { PaymentPage, PlanCard } from '../components'
import type { Plan } from '../types'
import { PLANS } from '../utils/plans'
import { usePaymentsStore } from '../stores'

const router = useRouter()
const store = usePaymentsStore()
const cycle = 'monthly'
const currentPlan = computed(() => (store.isSubscriber ? 'pro' : 'free'))
const plans = computed(() =>
  PLANS.filter((plan) => plan.id !== 'enterprise').map((plan) => ({
    ...plan,
    monthlyPrice: plan.id === 'pro' ? Number(store.price ?? 0) : 0,
    priceNote: plan.id === 'pro' ? 'pagamento único' : plan.priceNote,
    cta: plan.id === currentPlan.value ? 'Plano atual' : 'Liberar acesso à IA',
    features:
      plan.id === 'pro'
        ? [
            { label: 'Chat com IA para gerenciar tarefas', icon: 'ai' as const },
            { label: 'Análise de PDF e imagens', icon: 'ai' as const },
            { label: 'Relatórios em PDF', icon: 'check' as const },
          ]
        : plan.features,
  })),
)
onMounted(async () => {
  try {
    await store.refreshAccess()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Não foi possível consultar seu plano.')
  }
})
function choose(plan: Plan) {
  if (plan.id === 'free' || store.isSubscriber) return
  if (!store.price) {
    toast.error('Aguarde a consulta do valor do plano.')
    return
  }
  router.push({ name: 'Payment', query: { plano: 'pro' } })
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
    </header>

    <div class="mt-[12px] grid items-start gap-[18px] lg:grid-cols-3">
      <PlanCard
        v-for="plan in plans"
        :key="plan.id"
        :plan="plan"
        :cycle="cycle"
        :current="plan.id === currentPlan"
        @select="choose(plan)"
      />
    </div>

    <p class="text-center text-[12px] leading-normal text-(--text-muted)">
      Acesso individual à IA após confirmação do pagamento. Sem renovação automática.
    </p>
  </PaymentPage>
</template>
